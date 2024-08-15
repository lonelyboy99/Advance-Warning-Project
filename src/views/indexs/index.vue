<template>
  <div class="contents">
    <div class="contetn_left">
      <div class="pagetab">
        <div class="item">实时监测</div>
        <div class="item">MQTT:{{ mqttConnectionStatus }}</div>
      </div>
      <ItemWrap class="contetn_left-top contetn_lr-item" title="数据监控">
        <LeftTop/>
      </ItemWrap>
      <ItemWrap class="contetn_left-center contetn_lr-item" title="AI预测">
        <LeftPrediction/>
      </ItemWrap>
      <ItemWrap class="contetn_left-bottom contetn_lr-item" title="详细数据">
        <LeftBottomTop/>
      </ItemWrap>
      <ItemWrap class="contetn_left-extra contetn_lr-item" title="AI数据分析">
        <LeftExtra/>
      </ItemWrap>
    </div>
    <div class="contetn_center">
      <CenterMap class="contetn_center_top"/>
      <ItemWrap class="contetn_center-bottom" title="图表展示">
        <CenterBottom/>
      </ItemWrap>
    </div>
    <div class="contetn_right">
      <ItemWrap class="contetn_right-top contetn_lr-item" title="报警次数">
        <RightTop/>
      </ItemWrap>
      <ItemWrap class="contetn_right-center contetn_lr-item" title="电闸控制">
        <RightLight :publish="publish"/>
      </ItemWrap>
      <ItemWrap class="contetn_right-bottom contetn_lr-item" title="设备情况">
        <LeftBottom/>
      </ItemWrap>
      <ItemWrap class="contetn_right-extra contetn_lr-item" title="报警详情">
        <RightBottom/>
      </ItemWrap>
    </div>
  </div>
</template>


<script>
import LeftTop from './left-top.vue'
import LeftCenter from "./left-center.vue";
import LeftBottom from "./left-bottom.vue";
import LeftPrediction from "./left-center-prediction.vue";
import CenterMap from "./center-map.vue";
import CenterBottom from "./center-bottom.vue";
import RightTop from "./right-top.vue";
import RightCenter from "./right-center.vue";
import RightBottom from "./right-bottom.vue";
import RightLight from "./right-center-light.vue";
import LeftBottomTop from "./left-bottom-top.vue";
import LeftExtra from "./left-extra.vue";
import mqtt from "mqtt";
import {GET} from "@/api";


export default {
  components: {
    LeftTop,
    LeftCenter,
    LeftBottom,
    LeftPrediction,
    CenterMap,
    RightTop,
    RightCenter,
    RightBottom,
    RightLight,
    CenterBottom,
    LeftBottomTop,
    LeftExtra
  },
  data() {
    return {
      mqttConnectionStatus: '未连接', // 初始状态为未连接
      receivedMessages: [],// 接受消息存放数组
      idData: [],// 设备编号
      lngData: [],// 经度数据
      latData: [],// 维度数据
      timeData: [],// 时间数据
      chartUpdateInterval: null, // 定时器
    };
  },
  filters: {
    numsFilter(msg) {
      return msg || 0;
    },
  },
  created() {
  },

  mounted() {
    this.initMqtt();
  },
  methods: {
    /**
     * MQTT连接函数
     */
    initMqtt() {
      // 连接配置选项
      let options = {
        connectTimeout: 4000, // 超时时间
        clientId: '', // 不填默认随机生成一个ID
        protocol: 'ws', // 使用 WebSocket
      }
      this.client = mqtt.connect('ws://122.51.210.27:8083/mqtt', options)

      // 连接成功
      this.client.on('connect', () => {
        this.mqttConnectionStatus = '已连接';
        console.log('连接成功');

        // 连接成功后订阅消息
        this.subscribes();
      });

      // 重连提醒
      this.client.on('reconnect', (error) => {
        this.mqttConnectionStatus = '正在重连';
        console.log('正在重连', error);
      });

      // 连接失败提醒
      this.client.on('error', (error) => {
        this.mqttConnectionStatus = '连接失败';
        console.log('连接失败', error);
      });
    },

    /**
     * MQTT订阅函数(订阅多个信息)
     */
    subscribes() {
      const arr = ['transparent/req']
      this.client.subscribe(arr, {qos: 1}, (err) => {
        if (!err) {
          console.log(`主题为：“${arr}” 的消息订阅成功`)
        } else {
          console.log('消息订阅失败')
        }
      })
      // 在订阅成功后更新 receivedMessages 数组
      this.client.on('message', function (topic, message, packet) {
        this.handleReceivedMessage(topic, message, packet);
        console.log(`接收到消息，主题：${topic}, 消息：${message.toString()}`);
      }.bind(this));
    },

    /**
     * MQTT发布信息
     */
    publish(topic, message) {
      if (!this.client.connected) {
        console.log('客户端未连接')
        return
      }
      this.client.publish(topic, message, {qos: 0}, (err) => {
        if (!err) {
          console.log(`主题为：${topic},内容为：${message} 发布成功`)
        }
      })
    },

    /**
     * 从订阅主题消息中获取相应键值数据
     */
    getLatestValueByTopic(topic, key) {
      const messagesForTopic = this.receivedMessages.filter(message => message.topic === topic)
      if (messagesForTopic.length > 0) {
        const messageContent = JSON.parse(messagesForTopic[0].message)
        return messageContent[key] !== undefined ? messageContent[key] : 'N/A'
      } else {
        return 'N/A' // 如果没有匹配到消息，返回 "N/A"
      }
    },

    // /**
    //  * 更新数据数组
    //  */
    // updateChartData() {
    //   const temperature = this.getLatestValueByTopic('temp_hum/emqx', 'temp');
    //   const humidity = this.getLatestValueByTopic('temp_hum/emqx', 'hum');
    //   const light = this.getLatestValueByTopic('temp_hum/emqx', 'light');
    //   const power = this.getLatestValueByTopic('temp_hum/emqx', 'power');
    //   const id = this.getLatestValueByTopic('temp_hum/emqx', 'id');
    //   const led = this.getLatestValueByTopic('temp_hum/emqx', 'LED');
    //   const lng = this.getLatestValueByTopic('temp_hum/emqx', 'lng');
    //   const lat = this.getLatestValueByTopic('temp_hum/emqx', 'lat');
    //
    //   // 判断是否要添加数据
    //   if (temperature !== 'N/A' && humidity !== 'N/A' && light !== 'N/A' && power !== 'N/A') {
    //     const currentTime = new Date();
    //     const currentTimeString = currentTime.toISOString();
    //
    //     // 删除旧数据
    //     this.temperatureData = this.temperatureData.slice(-10);
    //     this.humidityData = this.humidityData.slice(-10);
    //     this.lightingData = this.lightingData.slice(-10);
    //     this.powerData = this.powerData.slice(-10);
    //     this.idData = this.idData.slice(-10);
    //     this.lngData = this.lngData.slice(-10);
    //     this.latData = this.latData.slice(-10);
    //
    //     // 判断是否是新数据
    //     if (!this.temperatureData.length || this.temperatureData[0].time !== currentTimeString) {
    //       // 添加新数据
    //       this.temperatureData.push({time: currentTimeString, value: temperature});
    //       this.humidityData.push({time: currentTimeString, value: humidity});
    //       this.lightingData.push({time: currentTimeString, value: light});
    //       this.powerData.push({time: currentTimeString, value: power});
    //       this.idData.push({time: currentTimeString, value: id});
    //       this.lngData.push({time: currentTimeString, value: lng});
    //       this.latData.push({time: currentTimeString, value: lat});
    //       this.timeData.push(currentTimeString);
    //     }
    //   }
    // },
    //
    // /**
    //  * 数据处理
    //  */
    handleReceivedMessage(topic, message, packet) {
      this.receivedMessages.unshift({
        topic,
        message: message.toString(),
        qos: packet.qos,
        time: new Date(),
      });
    },

    /**
     * 组件销毁函数
     */
    // 在组件销毁之前与mqtt断开连接
    beforeDestroy() {
      //断开连接
      this.client.end()
      this.client = null
      console.log('已经与mqtt客户端断开连接')

      //清除定时任务
      clearInterval(this.chartUpdateInterval);
    },
  }
};
</script>
<style lang="scss" scoped>
.contents {
  display: flex;
  height: 100vh; /* 确保内容充满视口高度 */

  .contetn_left,
  .contetn_right {
    width: 540px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between; // 平均分布空间
    position: relative;
    overflow: hidden; /* 防止内容溢出 */
  }

  .contetn_center {
    width: 720px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    overflow: hidden; /* 防止内容溢出 */
  }

  .contetn_lr-item {
    flex: 1; /* 确保每个 item 均分高度 */
    margin-bottom: 2px;
    max-height: 25%; /* 可以根据需要调整 */
    overflow: hidden; /* 防止内容超出 */

    &:last-child {
      margin-bottom: 0;
    }

    .item-content {
      height: 100%;
      overflow-y: auto; /* 启用垂直滚动 */
    }
  }

  .contetn_center_top {
    width: 100%;
    flex: 1; /* 确保高度均分 */
    overflow: hidden;
  }

  .contetn_center-bottom {
    height: 315px;
    overflow: hidden;
  }

  .contetn_right-bottom {
    height: auto;
    min-height: 200px;
    overflow: hidden; /* 避免内容超出 */
  }

}
</style>

