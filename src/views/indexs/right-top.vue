<template>
  <Echart
      id="rightTop"
      :options="option"
      class="right_top_inner"
      v-if="pageflag"
      ref="charts"
  />
  <Reacquire v-else @onclick="getData" style="line-height: 200px">
    重新获取
  </Reacquire>
</template>

<script>
import {currentGET} from "@/api";
import {graphic} from "echarts";

export default {
  data() {
    return {
      option: {},
      pageflag: false,
      timer: null,
    };
  },
  mounted() {
    this.getData();
    this.getDataHandle = setInterval(() => {
      this.getData();
    }, 10000);
  },
  beforeDestroy() {
    this.getDataHandle();
  },
  methods: {
    clearData() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    getData() {
      this.pageflag = true;
      currentGET("big2", {}).then((res) => {
        if (!this.timer) {
          console.log("报警次数", res);
        }
        if (res.success) {
          this.$nextTick(() => {
            this.init(res.data.category, res.data.smokeCount, res.data.overloadCount, res.data.overtempCount),
                this.switper();
          });
        } else {
          this.pageflag = false;
          this.$Message({
            text: res.msg,
            type: "warning",
          });
        }
      }).catch(error => {
        console.error('API调用失败:', error);
      });
    },
    switper() {
      if (this.timer) {
        return;
      }
      let looper = () => {
        this.getData();
      };
      this.timer = setInterval(
          looper,
          this.$store.state.setting.echartsAutoTime
      );
      let myChart = this.$refs.charts.chart;
      myChart.on("mouseover", () => {
        this.clearData();
      });
      myChart.on("mouseout", () => {
        this.timer = setInterval(
            looper,
            this.$store.state.setting.echartsAutoTime
        );
      });
    },
    init(xData, smokeData, overloadData, overtempData) {
      this.option = {
        xAxis: {
          type: "category",
          data: xData,
          boundaryGap: false, // 不留白，从原点开始
          splitLine: {
            show: true,
            lineStyle: {
              color: "rgba(31,99,163,.2)",
            },
          },
          axisLine: {
            lineStyle: {
              color: "rgba(31,99,163,.1)",
            },
          },
          axisLabel: {
            color: "#7EB7FD",
            fontWeight: "500",
          },
        },
        yAxis: {
          type: "value",
          splitLine: {
            show: true,
            lineStyle: {
              color: "rgba(31,99,163,.2)",
            },
          },
          axisLine: {
            lineStyle: {
              color: "rgba(31,99,163,.1)",
            },
          },
          axisLabel: {
            color: "#7EB7FD",
            fontWeight: "500",
          },
        },
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(0,0,0,.6)",
          borderColor: "rgba(147, 235, 248, .8)",
          textStyle: {
            color: "#FFF",
          },
        },
        grid: {
          show: true,
          left: "10px",
          right: "30px",
          bottom: "10px",
          top: "28px",
          containLabel: true,
          borderColor: "#1F63A3",
        },
        series: [
          {
            data: smokeData,
            type: "bar",
            smooth: true,
            symbol: "none", //去除点
            name: "烟雾报警次数",
            color: "rgba(252,144,16,.7)",
            areaStyle: {
              color: new graphic.LinearGradient(
                  0,
                  0,
                  0,
                  1,
                  [
                    {
                      offset: 0,
                      color: "rgba(252,144,16,.7)",
                    },
                    {
                      offset: 1,
                      color: "rgba(252,144,16,.0)",
                    },
                  ],
                  false
              ),
            },
            markPoint: {
              data: [
                {
                  name: "最大值",
                  type: "max",
                  valueDim: "y",
                  symbol: "rect",
                  symbolSize: [60, 26],
                  symbolOffset: [0, -20],
                  itemStyle: {
                    color: "rgba(0,0,0,0)",
                  },
                  label: {
                    color: "#FC9010",
                    backgroundColor: "rgba(252,144,16,0.1)",
                    borderRadius: 6,
                    padding: [7, 14],
                    borderWidth: 0.5,
                    borderColor: "rgba(252,144,16,.5)",
                    formatter: "烟雾报警：{c}",
                  },
                },
                {
                  name: "最大值",
                  type: "max",
                  valueDim: "y",
                  symbol: "circle",
                  symbolSize: 6,
                  itemStyle: {
                    color: "#FC9010",
                    shadowColor: "#FC9010",
                    shadowBlur: 8,
                  },
                  label: {
                    formatter: "",
                  },
                },
              ],
            },
          },
          {
            data: overloadData,
            type: "bar",
            smooth: true,
            symbol: "none", //去除点
            name: "故障次数",
            color: "rgba(9,202,243,.7)",
            areaStyle: {
              color: new graphic.LinearGradient(
                  0,
                  0,
                  0,
                  1,
                  [
                    {
                      offset: 0,
                      color: "rgba(9,202,243,.7)",
                    },
                    {
                      offset: 1,
                      color: "rgba(9,202,243,.0)",
                    },
                  ],
                  false
              ),
            },
            markPoint: {
              data: [
                {
                  name: "最大值",
                  type: "max",
                  valueDim: "y",
                  symbol: "rect",
                  symbolSize: [60, 26],
                  symbolOffset: [0, -20],
                  itemStyle: {
                    color: "rgba(0,0,0,0)",
                  },
                  label: {
                    color: "#09CAF3",
                    backgroundColor: "rgba(9,202,243,0.1)",
                    borderRadius: 6,
                    borderColor: "rgba(9,202,243,.5)",
                    padding: [7, 14],
                    formatter: "故障报警：{c}",
                    borderWidth: 0.5,
                  },
                },
                {
                  name: "最大值",
                  type: "max",
                  valueDim: "y",
                  symbol: "circle",
                  symbolSize: 6,
                  itemStyle: {
                    color: "#09CAF3",
                    shadowColor: "#09CAF3",
                    shadowBlur: 8,
                  },
                  label: {
                    formatter: "",
                  },
                },
              ],
            },
          },
          {
            data: overtempData,
            type: "bar",
            smooth: true,
            symbol: "none", //去除点
            name: "报警次数",
            color: "rgba(252,30,30,.7)",
            areaStyle: {
              color: new graphic.LinearGradient(
                  0,
                  0,
                  0,
                  1,
                  [
                    {
                      offset: 0,
                      color: "rgba(252,30,30,.7)",
                    },
                    {
                      offset: 1,
                      color: "rgba(252,30,30,.0)",
                    },
                  ],
                  false
              ),
            },
            markPoint: {
              data: [
                {
                  name: "最大值",
                  type: "max",
                  valueDim: "y",
                  symbol: "rect",
                  symbolSize: [60, 26],
                  symbolOffset: [0, -20],
                  itemStyle: {
                    color: "rgba(0,0,0,0)",
                  },
                  label: {
                    color: "#FC1E1E",
                    backgroundColor: "rgba(252,30,30,0.1)",
                    borderRadius: 6,
                    padding: [7, 14],
                    borderWidth: 0.5,
                    borderColor: "rgba(252,30,30,.5)",
                    formatter: "报警次数：{c}",
                  },
                },
                {
                  name: "最大值",
                  type: "max",
                  valueDim: "y",
                  symbol: "circle",
                  symbolSize: 6,
                  itemStyle: {
                    color: "#FC1E1E",
                    shadowColor: "#FC1E1E",
                    shadowBlur: 8,
                  },
                  label: {
                    formatter: "",
                  },
                },
              ],
            },
          },
        ],
      };
    },
  },
};
</script>

<style lang='scss' scoped>
.right_top_inner {
  margin-top: -8px;
}
</style>
