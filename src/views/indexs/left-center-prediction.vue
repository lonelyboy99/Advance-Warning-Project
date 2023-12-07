<template>
  <div>
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <div style="padding: 40px 10px 16px 10px">
        <t-date-picker
            size="large"
            v-model="selectedDate"
            enableTimePicker
            allowInput
            placeholder="请选择预测日期"
        />
      </div>
      <br>
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div class="button-container">
          <t-button class="button-container-item" @click="predictTemperature" size="large">预测给定时间</t-button>
          <t-button class="button-container-item" @click="predictTenHours" size="large">预测十个小时</t-button>
        </div>
        <p class="t-input__inner" v-if="predictedTemperature !== null" style="padding: 40px">
          预测结果：{{ predictedTemperature.toFixed(2) }}°C
        </p>
      </div>
    </div>

    <!-- 弹窗组件 -->
    <div class="modal" v-show="modalVisible">
      <div class="modal-content">
        <span class="close" @click="close"></span>
        <h2>未来十小时温度预测</h2>
        <!-- ECharts 容器 -->
        <div ref="chartContainer" style="width: 100%; height: 100%;padding: 10px"></div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import * as echarts from 'echarts';
import {graphic} from "echarts";

export default {
  data() {
    return {
      selectedDate: null,
      predictedTemperature: null,
      modalVisible: false,
      predictions: [],
      modalChartOptions: {},
      chartInstance: null,
    };
  },
  computed: {
    dateComponents() {
      const date = this.selectedDate ? new Date(this.selectedDate) : null;
      return {
        year: date ? date.getFullYear() : null,
        month: date ? date.getMonth() + 1 : null,
        day: date ? date.getDate() : null,
        hour: date ? date.getHours() : null,
        minute: date ? date.getMinutes() : null,
        second: date ? date.getSeconds() : null,
      };
    },
  },
  methods: {
    async predictTemperature() {
      try {
        const response = await this.predictTemperatureForTime(new Date(this.selectedDate));
        this.handlePredictionResponse(response);
      } catch (error) {
        this.handleError(error);
      }
    },

    async predictTenHours() {
      try {
        this.predictions = [];
        for (let i = 1; i <= 10; i++) {
          const nextHour = new Date();
          nextHour.setHours(nextHour.getHours() + i);
          const response = await this.predictTemperatureForTime(nextHour);
          if (response && response.predicted_temperature !== undefined) {
            this.predictions.push({
              time: nextHour.toLocaleTimeString(),
              temperature: response.predicted_temperature.toFixed(2),
            });
          }
        }
        this.modalVisible = true;
        this.$nextTick(() => {
          this.initializeChart();
          this.updateChart(this.predictions);
        });
      } catch (error) {
        this.handleError(error);
      }
    },

    async predictTemperatureForTime(dateTime) {
      try {
        const axiosInstance = axios.create({
          baseURL: 'http://122.51.210.27:5000',
        });
        const response = await axiosInstance.post('/predict_temperature', {
          ...this.dateComponents,
          year: dateTime.getFullYear(),
          month: dateTime.getMonth() + 1,
          day: dateTime.getDate(),
          hour: dateTime.getHours(),
          minute: dateTime.getMinutes(),
          second: dateTime.getSeconds(),
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    handlePredictionResponse(response) {
      if (response && response.predicted_temperature !== undefined) {
        this.predictedTemperature = response.predicted_temperature;
      } else {
        console.error('未找到预测温度属性或数据为空');
      }
    },

    handleError(error) {
      console.error('错误：', error);
      if (error.response) {
        console.log('响应数据：', error.response.data);
      }
    },

    close() {
      this.modalVisible = false;
    },

    initializeChart() {
      // 销毁现有的图表实例
      if (this.chartInstance) {
        this.chartInstance.dispose();
      }

      // 创建一个新的 ECharts 实例并将其设置到 ref 中
      this.chartInstance = echarts.init(this.$refs.chartContainer);

      // 初始选项（根据需要自定义）
      this.modalChartOptions = {
        xAxis: {
          type: 'category',
          data: [],
          axisLine: {
            lineStyle: {
              color: 'white',
            },
          },
          axisLabel: {
            textStyle: {
              color: 'white',
              fontSize: 20,
            },
          },
        },
        yAxis: {
          type: 'value',
          name: '温度 (°C)',
          nameTextStyle: {
            color: 'white',
            fontSize: 16,
          },
          axisLine: {
            lineStyle: {
              color: 'white',
            },
          },
          axisLabel: {
            textStyle: {
              color: 'white',
              fontSize: 17,
            },
          },
        },
        series: [
          {
            name:'温度',
            data: [],
            type: 'line',
            smooth: true,
            lineStyle: {
              width: 7,
            },
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: 'rgba(127, 255, 212, 1)' },
                { offset: 0.2, color: 'rgba(127, 255, 212, 0.7)' },
                { offset: 1, color: 'rgba(127, 255, 212, 0.5)' }
              ]),
            },
          },
        ],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985',
            },
          },
        },
        legend: {
          data: ['温度'],
          textStyle: {
            color: "#ffffff",
            fontSize: 17,
          },
        },
      };

      // 将选项设置到图表中
      this.chartInstance.setOption(this.modalChartOptions);
    },

    updateChart(predictions) {
      if (this.chartInstance && predictions.length > 0) {
        const chartData = predictions.map(prediction => ({
          time: prediction.time,
          temperature: parseFloat(prediction.temperature),
        }));

        const xAxisData = chartData.map(item => item.time);
        const seriesData = chartData.map(item => item.temperature);

        this.modalChartOptions.xAxis.data = xAxisData;
        this.modalChartOptions.series[0].data = seriesData;

        this.chartInstance.setOption(this.modalChartOptions);
      }
    },
  },
};
</script>

<style>
.button-container {
  display: flex;
  width: 100%;
  justify-content: space-around;
}
.button-container-item {
  flex-basis: 120px;
}
.t-input {
  border-color: transparent;
  background-color: transparent;
}
.t-input .t-input__suffix > .t-icon {
  color: white;
  transition: all 0.2s linear;
  width: 1.5em;
  height: 1.5em;
}
.t-input__inner::placeholder {
  color: white;
}

.t-input__inner {
  color: white;
  font-size: 20px;
}

.t-input.t-is-readonly .t-input__inner {
  color: black;
  cursor: pointer;
  font-size: 14px;
}

/* 弹窗样式 */
.modal {
  position: fixed;
  z-index: 3;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: transparent;
  margin: 10% auto;
  padding: 20px;
  border: 1px solid transparent;
  width: 40%;
  height: 40%;
  position: relative; /* 添加此行 */
}

.close {
  position: absolute;
  top: 10px;
  right: 3px;
  color: white;
  font-size: 40px;
  font-weight: bold;
  cursor: pointer;
}

.close::before {
  content: '\00D7'; /* 'x' 字符的 Unicode 表示 */
}
.modal h2 {
  font-size: 40px;
  font-weight: 900;
  letter-spacing: 6px;
  width: 100%;
  background: linear-gradient(92deg, #0072FF 0%, #00EAFF 48.8525390625%, #01AAFF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
}
</style>
