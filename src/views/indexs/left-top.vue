<!-- left-center.vue -->
<template>
  <ul class="user_Overview flex" v-if="pageflag">
    <li class="user_Overview-item" style="color: #00fdfa">
      <div class="user_Overview_nums allnum">
        <dv-digital-flop :config="temperatureConfig" style="width:100%;height:100%;" />
      </div>
      <p>温度</p>
    </li>
    <li class="user_Overview-item" style="color: #07f7a8">
      <div class="user_Overview_nums online">
        <dv-digital-flop :config="humidityConfig" style="width:100%;height:100%;" />
      </div>
      <p>湿度</p>
    </li>
    <li class="user_Overview-item" style="color: #e3b337">
      <div class="user_Overview_nums offline">
        <dv-digital-flop :config="lightingConfig" style="width:100%;height:100%;" />
      </div>
      <p>光强</p>
    </li>
    <li class="user_Overview-item" style="color: #f5023d">
      <div class="user_Overview_nums laramnum">
        <dv-digital-flop :config="powerConfig" style="width:100%;height:100%;" />
      </div>
      <p>功率</p>
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    // 接收温度数据
    temperatureData: {
      type: Array,
      default: () => [],
    },
    // 接收湿度数据
    humidityData: {
      type: Array,
      default: () => [],
    },
    // 接收光强数据
    lightingData: {
      type: Array,
      default: () => [],
    },
    // 接收功率数据
    powerData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      // 在这里定义子组件自己的数据
      pageflag: true,
    };
  },
  methods: {},
  computed: {
    // 计算属性，处理接收到的数据
    temperatureConfig() {
      return {
        number: this.temperatureData.length > 0 ? [this.temperatureData[0].value] : [0],
        content: '{nt}',
        style: {
          fontSize: 24,
          fill: "#00fdfa",
        },
      };
    },
    humidityConfig() {
      return {
        number: this.humidityData.length > 0 ? [this.humidityData[0].value] : [0],
        content: '{nt}',
        style: {
          fontSize: 24,
          fill: "#07f7a8",
        },
      };
    },
    lightingConfig() {
      return {
        number: this.lightingData.length > 0 ? [this.lightingData[0].value] : [0],
        content: '{nt}',
        style: {
          fontSize: 24,
          fill: "#e3b337",
        },
      };
    },
    powerConfig() {
      return {
        number: this.powerData.length > 0 ? [this.powerData[0].value] : [0],
        content: '{nt}',
        style: {
          fontSize: 24,
          fill: "#f5023d",
        },
      };
    },
  },
};
</script>

<style lang='scss' scoped>
.user_Overview {
  li {
    flex: 1;

    p {
      text-align: center;
      height: 16px;
      font-size: 16px;
    }

    .user_Overview_nums {
      width: 100px;
      height: 100px;
      text-align: center;
      line-height: 100px;
      font-size: 22px;
      margin: 50px auto 30px;
      background-size: cover;
      background-position: center center;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
      }

      &.bgdonghua::before {
        animation: rotating 14s linear infinite;
      }
    }

    .allnum {
      &::before {
        background-image: url("../../assets/img/left_top_lan.png");
      }
    }

    .online {
      &::before {
        background-image: url("../../assets/img/left_top_lv.png");
      }
    }

    .offline {
      &::before {
        background-image: url("../../assets/img/left_top_huang.png");
      }
    }

    .laramnum {
      &::before {
        background-image: url("../../assets/img/left_top_hong.png");
      }
    }
  }
}
</style>
