<template>
  <div class="center_bottom">
    <Echart
        :options="options"
        id="bottomLeftChart"
        class="echarts_bottom"
    ></Echart>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      options: {},
      apiList: [
        "http://122.51.210.27:8030/api/devices",
        "http://122.51.210.27:8030/api/devices1",
        "http://122.51.210.27:8030/api/devices2",
        "http://122.51.210.27:8030/api/devices3",
        "http://122.51.210.27:8030/api/devices4",
        "http://122.51.210.27:8030/api/devices5",
        "http://122.51.210.27:8030/api/devices6",
        "http://122.51.210.27:8030/api/devices7",
        "http://122.51.210.27:8030/api/devices8",
      ],
    };
  },
  mounted() {
    this.getData();
    this.intervalId = setInterval(() => {
      this.getData();
    }, 10000); // 每10秒更新一次
  },
  methods: {
    getData() {
      const allDataPromises = this.apiList.map((url) => {
        return axios.get(url).then((res) => {
          console.log(`完整的响应数据 (${url}):`, res.data);
          // 检查 res.data.data 是否存在，并确认 list 是数组
          if (res.data || res.data.data || Array.isArray(res.data.data.list)) {
            return res.data.list; // 返回数据列表
          } else {
            console.warn(`从 ${url} 获取的数据结构不符合预期`);
            return null;
          }
        }).catch((error) => {
          console.error(`请求 ${url} 出错:`, error);
          return null; // 返回 null 以便过滤掉失败的请求
        });
      });

      // 等待所有请求完成
      Promise.all(allDataPromises).then((results) => {
        const filteredResults = results.filter(result => result !== null);
        console.log("获取的所有数据: ", results);
        console.log("过滤后的数据: ", filteredResults);
        if (filteredResults.length > 0) {
          this.init(filteredResults);
        } else {
          this.$Message({
            text: "未能获取到任何数据",
            type: "warning",
          });
        }
      });
    },
    init(allData) {
      // 整理图表 series 数据
      const combinedSeries = allData.map((deviceData, index) => {
        // 只获取最后10个数据点
        const lastTenData = deviceData.slice(-10);
        return {
          name: `设备${index + 1}`,
          type: "line",
          smooth: true,
          showAllSymbol: true,
          symbol: "emptyCircle",
          symbolSize: 8,
          yAxisIndex: 0, // 修改为使用第一个y轴 (mA)
          data: lastTenData.map(item => item.remaindeRelectric),
        };
      });

      // 使用第一个设备的时间数据作为 X 轴
      const category = allData.length > 0 ? allData[0].slice(-10).map(item => item.time) : [];

      this.options = {
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(0,0,0,.6)",
          borderColor: "rgba(147, 235, 248, .8)",
          textStyle: {
            color: "#FFF",
          },
          formatter: function (params) {
            let result = params[0].name + "<br>";
            params.forEach(function (item) {
              result +=
                  item.marker +
                  " " +
                  item.seriesName +
                  " : " +
                  item.value +
                  "mA</br>";
            });
            return result;
          },
        },
        legend: {
          data: combinedSeries.map((s) => s.name),
          textStyle: {
            color: "#B4B4B4",
          },
          top: "0",
        },
        grid: {
          left: "50px",
          right: "40px",
          bottom: "30px",
          top: "20px",
        },
        xAxis: {
          data: category,
          axisLine: {
            lineStyle: {
              color: "#B4B4B4",
            },
          },
          axisTick: {
            show: false,
          },
        },
        yAxis: [
          {
            splitLine: {show: false},
            axisLine: {
              lineStyle: {
                color: "#B4B4B4",
              },
            },
            axisLabel: {
              formatter: "{value}mA",
            },
          },
        ],
        series: combinedSeries,
      };
    },
    beforeDestroy() {
      clearInterval(this.intervalId);
    },
  }
};
</script>

<style lang="scss" scoped>
.center_bottom {
  width: 100%;
  height: 100%;

  .echarts_bottom {
    width: 100%;
    height: 100%;
  }
}
</style>
