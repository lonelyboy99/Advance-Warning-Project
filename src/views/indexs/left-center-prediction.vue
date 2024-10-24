<template>
  <div class="left_bottom_top">
    <Echart :options="options" id="bottomLeftTopChart" class="echarts_bottom"></Echart>
    <div class="warning-message" v-if="showWarning">
      <span>警告：故障概率正在急剧上升，可能存在潜在风险！</span>
    </div>
  </div>
</template>

<script>
import { graphic } from "echarts";
import TransparentModal from './TransparentModal.vue';

export default {
  components: {
    TransparentModal,
  },
  data() {
    return {
      options: {},
      intervalId: null,
      showWarning: false,
      isModalVisible: false,
    };
  },
  mounted() {
    this.init();
    this.intervalId = setInterval(() => {
      this.updateData();
    }, 10000); // Update every 10 seconds
  },
  beforeDestroy() {
    clearInterval(this.intervalId);
  },
  methods: {
    init() {
      this.updateData(); // Initialize the chart with the first set of data
    },
    updateData() {
      const timestamp = new Date().toLocaleTimeString();
      const currentValue = 0.1 + Math.random(); // Generate Remaining Current, allowing it to exceed 0.6
      const aiValue = Math.min(currentValue, 0.6); // AI Prediction capped at 0.6
      let faultProb = Math.abs(currentValue - aiValue) * 100;

      // Add 40% to Fault Probability if Remaining Current exceeds 0.6
      if (currentValue > 0.6) {
        faultProb += 40;
      }

      // Check for pre-warning condition
      if (this.options.series && this.options.series[2].data.length > 1) {
        const lastFaultProb = this.options.series[2].data.slice(-1)[0];
        if (faultProb > lastFaultProb * 1.5) { // If the fault probability increases by 50% compared to the last recorded value
          this.showWarning = true;
        } else {
          this.showWarning = false;
        }
      }

      // Add data points to the series
      if (this.options.series) {
        this.options.xAxis.data.push(timestamp);
        this.options.series[0].data.push(currentValue.toFixed(2));
        this.options.series[1].data.push(aiValue.toFixed(2));
        this.options.series[2].data.push(faultProb.toFixed(2));
      } else {
        // Initial data setup
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
                    (item.seriesName === "故障概率" ? "%" : " A") +
                    "</br>";
              });
              return result;
            },
          },
          legend: {
            data: ["剩余电流", "AI预测", "故障概率"],
            textStyle: {
              color: "#B4B4B4",
              fontSize: 15,
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
            data: [timestamp],
            axisLine: {
              lineStyle: {
                color: "#B4B4B4",
              },
            },
            axisTick: {
              show: false,
            },
            axisLabel: {
              fontSize: 16, // 调整字体大小
              margin: 8, // 标签与轴线的间距
              formatter: function (value) {
                return value.substring(0, 8); // 截断显示
              },
            },
          },
          yAxis: [
            {
              name: "",
              splitLine: {show: false},
              axisLine: {
                lineStyle: {
                  color: "#B4B4B4",
                },
              },
              axisLabel: {
                formatter: "{value} A",
                fontSize: 14, // 调整字体大小
              },
            },
            {
              name: "",
              splitLine: {show: false},
              axisLine: {
                lineStyle: {
                  color: "#B4B4B4",
                },
              },
              axisLabel: {
                formatter: "{value}%",
                fontSize: 12, // 调整字体大小
              },
              min: 0,
              max: 100,
            },
          ],
          series: [
            {
              name: "剩余电流",
              type: "line",
              smooth: true,
              showAllSymbol: true,
              symbol: "emptyCircle",
              symbolSize: 8,
              data: [currentValue],
            },
            {
              name: "AI预测",
              type: "line",
              smooth: true,
              showAllSymbol: true,
              symbol: "emptyCircle",
              symbolSize: 8,
              data: [aiValue],
            },
            {
              name: "故障概率",
              type: "bar",
              smooth: true,
              showAllSymbol: true,
              symbol: "emptyCircle",
              symbolSize: 8,
              yAxisIndex: 1,
              data: [faultProb.toFixed(2)],
            },
          ],
        };
      }

      const maxDataPoints = 50;
      if (this.options.xAxis.data.length > maxDataPoints) {
        this.options.xAxis.data.shift();
        this.options.series.forEach((series) => series.data.shift());
      }

      this.$refs.bottomLeftTopChart && this.$refs.bottomLeftTopChart.resize();
    },
    showModal() {
      this.isModalVisible = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.left_bottom_top {
  width: 100%;
  height: 100%;
  position: relative;

  .echarts_bottom {
    width: 100%;
    height: 100%;
  }

  .warning-message {
    color: red;
    font-weight: bold;
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(255, 255, 0, 0.7);
    padding: 10px;
    border-radius: 5px;
  }

  .chart-link { /* 放大查看图表的文字链接样式 */
    position: absolute;
    bottom: 7px; /* 距离底部10px */
    right: 0px; /* 距离右边10px */
    color: #3498db; /* 文字颜色 */
    cursor: pointer; /* 鼠标悬停时显示指针 */
    font-size: 14px; /* 文字大小 */

    &:hover {
      color: #2980b9; /* 悬停时的颜色 */
    }
  }

  .echarts_modal {
    width: 100%;
    height: 100%;
  }
}
</style>
