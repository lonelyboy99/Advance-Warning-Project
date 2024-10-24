<template>
  <div class="contents">
    <div class="contetn_left">
      <ItemWrap class="contetn_left-top contetn_lr-item" title="数据监控" :disableZoom="true">
        <LeftTop/>
      </ItemWrap>
      <ItemWrap class="contetn_left-center contetn_lr-item" title="AI预测">
        <LeftPrediction/>
      </ItemWrap>
      <!--      <ItemWrap class="content_left-item" title="详细数据" :disableZoom="true">-->
      <!--        <LeftBottomTop/>-->
      <!--      </ItemWrap>-->
      <ItemWrap class="contetn_left-bottom contetn_lr-item"
                title="AI数据分析"
                :disableZoom="true"
                style="padding: 0 10px 16px 10px"
      >
        <LeftExtra/>
      </ItemWrap>
    </div>
    <div class="contetn_center">
      <CenterMap class="contetn_center_top" />
      <ItemWrap class="contetn_center-bottom" title="图表展示">
        <CenterBottom/>
      </ItemWrap>
    </div>
      <div class="contetn_right">
      <ItemWrap class="contetn_left-bottom contetn_lr-item"
                title="报警次数">
        <RightTop/>
      </ItemWrap>
      <ItemWrap class="contetn_left-bottom contetn_lr-item"
                title="电闸控制" :disableZoom="true">
        <RightLight :publish="publish"/>
      </ItemWrap>
      <ItemWrap class="contetn_left-bottom contetn_lr-item"
                title="设备情况">
        <LeftBottom/>
      </ItemWrap>
      <!--      <ItemWrap class="content_right-item" title="报警详情">-->
      <!--        <RightBottom/>-->
      <!--      </ItemWrap>-->
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
      this.client.subscribe(arr, {qos: 1}, (err) => {
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
      this.client.publish(topic, message, {qos: 0}, (err) => {
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
// 内容
.contents {
  .contetn_left,
  .contetn_right {
    width: 540px;
    box-sizing: border-box;
    // padding: 16px 0;
  }

  .contetn_center {
    width: 720px;
  }

  //左右两侧 三个块
  .contetn_lr-item {
    height: 310px;
  }

  .contetn_center_top {
    width: 100%;
  }

  // 中间
  .contetn_center {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }

  .contetn_center-bottom {
    height: 315px;
  }

  //左边 右边 结构一样
  .contetn_left,
  .contetn_right {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    position: relative;


  }
}


@keyframes rotating {
  0% {
    -webkit-transform: rotate(0) scale(1);
    transform: rotate(0) scale(1);
  }
  50% {
    -webkit-transform: rotate(180deg) scale(1.1);
    transform: rotate(180deg) scale(1.1);
  }
  100% {
    -webkit-transform: rotate(360deg) scale(1);
    transform: rotate(360deg) scale(1);
  }
}
</style>
