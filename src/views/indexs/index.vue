<template>
  <div class="contents">
    <div class="content_left">
      <div class="pagetab">
        <div class="item">实时监测</div>
        <div class="item">MQTT:{{ mqttConnectionStatus }}</div>
      </div>
      <ItemWrap class="content_left-item" title="数据监控">
        <LeftTop/>
      </ItemWrap>
      <ItemWrap class="content_left-item" title="AI预测">
        <LeftPrediction/>
      </ItemWrap>
      <ItemWrap class="content_left-item" title="详细数据">
        <LeftBottomTop/>
      </ItemWrap>
      <ItemWrap class="content_left-item" title="AI数据分析">
        <LeftExtra/>
      </ItemWrap>
    </div>
    <div class="content_center">
      <CenterMap class="content_center-top"/>
      <ItemWrap class="content_center-bottom" title="图表展示">
        <CenterBottom/>
      </ItemWrap>
    </div>
    <div class="content_right">
      <ItemWrap class="content_right-item" title="报警次数">
        <RightTop/>
      </ItemWrap>
      <ItemWrap class="content_right-item" title="电闸控制">
        <RightLight :publish="publish"/>
      </ItemWrap>
      <ItemWrap class="content_right-item" title="设备情况">
        <LeftBottom/>
      </ItemWrap>
      <ItemWrap class="content_right-item" title="报警详情">
        <RightBottom/>
      </ItemWrap>
    </div>
  </div>
</template>
<script>
import LeftTop from './left-top.vue'
import LeftPrediction from "./left-center-prediction.vue";
import LeftBottomTop from "./left-bottom-top.vue";
import LeftExtra from "./left-extra.vue";
import CenterMap from "./center-map.vue";
import CenterBottom from "./center-bottom.vue";
import RightTop from "./right-top.vue";
import RightLight from "./right-center-light.vue";
import LeftBottom from "./left-bottom.vue";
import RightBottom from "./right-bottom.vue";
import mqtt from "mqtt";

export default {
  components: {
    LeftTop,
    LeftPrediction,
    LeftBottomTop,
    LeftExtra,
    CenterMap,
    CenterBottom,
    RightTop,
    RightLight,
    LeftBottom,
    RightBottom
  },
  data() {
    return {
      mqttConnectionStatus: '未连接', // 初始状态为未连接
      receivedMessages: [], // 接收消息存放数组
    };
  },
  mounted() {
    this.initMqtt();
  },
  methods: {
    initMqtt() {
      let options = {
        connectTimeout: 4000, // 超时时间
        clientId: '', // 默认随机生成一个ID
        protocol: 'ws', // 使用 WebSocket
      };
      this.client = mqtt.connect('ws://122.51.210.27:8083/mqtt', options);

      this.client.on('connect', () => {
        this.mqttConnectionStatus = '已连接';
        this.subscribes();
      });

      this.client.on('reconnect', (error) => {
        this.mqttConnectionStatus = '正在重连';
      });

      this.client.on('error', (error) => {
        this.mqttConnectionStatus = '连接失败';
      });
    },
    subscribes() {
      const arr = ['transparent/req'];
      this.client.subscribe(arr, { qos: 1 }, (err) => {
        if (!err) {
          console.log(`主题为：“${arr}” 的消息订阅成功`);
        }
      });
      this.client.on('message', (topic, message, packet) => {
        this.handleReceivedMessage(topic, message, packet);
      });
    },
    publish(topic, message) {
      if (!this.client.connected) {
        console.log('客户端未连接');
        return;
      }
      this.client.publish(topic, message, { qos: 0 }, (err) => {
        if (!err) {
          console.log(`主题为：${topic},内容为：${message} 发布成功`);
        }
      });
    },
    handleReceivedMessage(topic, message, packet) {
      this.receivedMessages.unshift({
        topic,
        message: message.toString(),
        qos: packet.qos,
        time: new Date(),
      });
    },
    beforeDestroy() {
      this.client.end();
      this.client = null;
    },
  }
};
</script>
<style lang="scss" scoped>
.contents {
  display: flex;
  justify-content: space-between;
  height: 100vh; // 适应全屏高度

  .content_left,
  .content_right {
    width: 25%; // 左右两侧各占25%
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    padding: 16px 0;
  }

  .content_center {
    width: 50%; // 中间部分占50%
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  // 左右两侧每个块的样式
  .content_left-item,
  .content_right-item {
    height: calc((100% - 48px) / 4); // 四个块的高度均分
    margin-bottom: 16px;
  }

  // 去掉最后一个块的下间距
  .content_left-item:last-child,
  .content_right-item:last-child {
    margin-bottom: 0;
  }

  // 中间部分的顶部和底部块样式
  .content_center-top {
    height: 50%; // 占用中间区域的一半高度
  }

  .content_center-bottom {
    height: 50%; // 占用中间区域的另一半高度
  }
}

@keyframes rotating {
  0% {
    transform: rotate(0) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.1);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}
</style>
