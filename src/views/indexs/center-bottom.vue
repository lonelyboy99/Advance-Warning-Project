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
import { currentGET } from "api";
import { graphic } from "echarts";
export default {
  data() {
    return {
      options: {},
    };
  },
  props: {},
  mounted() {
    this.getData();
    this.intervalId = setInterval(() => {
      this.getData();
    }, 10000); // 每10秒更新一次，单位是毫秒
  },
  methods: {
    getData() {
      currentGET("big6", {}).then((res) => {
        console.log("图表展示", res);
        if (res.success) {
          this.init(res.data);
        } else {
          this.$Message({
            text: res.msg,
            type: "warning",
          });
        }
      });
    },
    init(newData) {
      // 创建多个系列，并将 CH1 改为 "剩余电流"
      const series = Object.keys(newData.seriesData).map((aisleName) => {
        let seriesName = aisleName === "CH1" ? "剩余电流" : aisleName;

        return {
          name: seriesName,
          type: "line",
          smooth: true,
          showAllSymbol: true,
          symbol: "emptyCircle",
          symbolSize: 8,
          yAxisIndex: seriesName === "剩余电流" ? 1 : 0, // "剩余电流" 使用第二个y轴（mA）
          data: newData.seriesData[aisleName],
        };
      });

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
              const unit = item.seriesName === "剩余电流" ? "mA" : "℃";
              result +=
                  item.marker +
                  " " +
                  item.seriesName +
                  " : " +
                  item.value +
                  unit +
                  "</br>";
            });
            return result;
          },
        },
        legend: {
          data: series.map((s) => s.name), // 显示所有系列的名字
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
          data: newData.category,
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
            splitLine: { show: false },
            axisLine: {
              lineStyle: {
                color: "#B4B4B4",
              },
            },
            axisLabel: {
              formatter: "{value}°C",
            },
          },
          {
            splitLine: { show: false },
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
        series: series,
      };
    },
    beforeDestroy() {
      clearInterval(this.intervalId);
    },
  },
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
