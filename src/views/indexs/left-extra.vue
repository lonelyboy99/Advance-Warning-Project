<template>
  <div
      v-if="pageflag"
      class="left_extra_wrap beautify-scroll-def"
      :class="{ 'overflow-y-auto': !sbtxSwiperFlag }"
  >
    <component :is="components" :data="list" :class-option="defaultOption">
      <ul class="left_extra">
        <li class="left_extra_item" v-for="(item, i) in list" :key="i">
          <span class="orderNum doudong">{{ i + 1 }}</span>
          <div class="inner_right">
            <div class="dibu"></div>
            <div class="flex">
              <div class="info">
                <span class="labels">数值名称：</span>
                <span class="contents zhuyao doudong wangguan">
                  {{ item.name }}</span>
              </div>
              <div class="info">
                <span class="labels">更新时间：</span>
                <span class="contents " style="font-size: 12px">
                  {{ updateTime }}</span>
              </div>
            </div>

            <span
                class="types doudong"
                :class="{
                typeRed: item.status === '异常',
                typeGreen: item.status === '正常',
              }"
            >
              {{ item.status }}
              <span v-if="item.trend === 'up'">⬆️</span>
              <span v-if="item.trend === 'down'">⬇️</span>
            </span>
            <div class="flex">
              <div class="info addresswrap">
                <span class="labels">当前值：</span>
                <span class="contents zhuyao doudong wangguan" style="font-size: 20px">
                {{ item.value }}</span
                >
              </div>
              <div class="info addresswrap">
                <span class="labels">上次值：</span>
                <span class="contents ciyao" style="font-size: 12px">
                {{ item.previousValue }}</span
                >
              </div>
            </div>
          </div>
        </li>
      </ul>
    </component>
  </div>

  <Reacquire v-else @onclick="getData" style="line-height: 200px"/>
</template>

<script>
import {currentGET} from "api";
import vueSeamlessScroll from "vue-seamless-scroll"; // vue2引入方式
import Kong from "../../components/kong.vue";

export default {
  components: {vueSeamlessScroll, Kong},
  data() {
    return {
      list: [],
      pageflag: true,
      updateTime: '', // 用于存储接口调用时间
      components: vueSeamlessScroll,
      defaultOption: {
        ...this.$store.state.setting.defaultOption,
        singleHeight: 240,
        limitMoveNum: 5,
        step: 0,
      },
    };
  },
  computed: {
    sbtxSwiperFlag() {
      let sbtxSwiper = this.$store.state.setting.sbtxSwiper;
      if (sbtxSwiper) {
        this.components = vueSeamlessScroll;
      } else {
        this.components = Kong;
      }
      return sbtxSwiper;
    },
  },
  created() {
  },

  mounted() {
    this.getData();
    this.getDataHandle = setInterval(() => {
      this.getData();
    }, 10000);
  },
  beforeDestroy() {
    clearInterval(this.getDataHandle);
  },
  methods: {
    getData() {
      this.pageflag = true;
      currentGET("device", {}).then((res) => {
        if (res.success) {
          const snap = res.data.snap;
          const currentTime = new Date().toLocaleString();
          this.updateTime = currentTime;

          const newList = [
            {name: 'A相电流', value: snap.Ia},
            {name: 'B相电流', value: snap.Ib},
            {name: 'C相电流', value: snap.Ic},
            {name: 'A相有功功率', value: snap.Pa},
            {name: 'B相有功功率', value: snap.Pb},
            {name: 'C相有功功率', value: snap.Pc},
          ];

          this.list = newList.map((item, index) => {
            const previousValue = this.list[index] ? this.list[index].value : item.value;
            const trend = this.calculateTrend(item.value, previousValue);
            const status = this.calculateStatus(item.value, previousValue);

            return {
              ...item,
              previousValue,
              trend,
              status
            };
          });

          // 将异常项目移到顶部
          this.list.sort((a, b) => (a.status === '异常' ? -1 : 1));

          let timer = setTimeout(() => {
            clearTimeout(timer);
            this.defaultOption.step = this.$store.state.setting.defaultOption.step;
          }, this.$store.state.setting.defaultOption.waitTime);
        } else {
          this.pageflag = false;
          this.$Message({
            text: res.msg,
            type: "warning",
          });
        }
      });
    },
    calculateTrend(currentValue, previousValue) {
      if (currentValue > previousValue) {
        return 'up';
      } else if (currentValue < previousValue) {
        return 'down';
      }
      return 'normal';
    },
    calculateStatus(currentValue, previousValue) {
      const threshold = 0.2; // 波动阈值，超过则为异常
      if (Math.abs(currentValue - previousValue) / previousValue > threshold) {
        return '异常';
      }
      return '正常';
    },
  },
};
</script>

<style lang='scss' scoped>
.left_extra_wrap {
  overflow: hidden;
  width: 100%;
  height: 80%;
}

.doudong {
  overflow: hidden;
  -webkit-backface-visibility: hidden;
  -moz-backface-visibility: hidden;
  -ms-backface-visibility: hidden;
  backface-visibility: hidden;
}

.overflow-y-auto {
  overflow-y: auto;
}

.left_extra {
  width: 100%;
  height: 100%;

  .left_extra_item {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    font-size: 14px;
    margin: 10px 0;

    .orderNum {
      margin: 0 16px 0 -20px;
    }

    .info {
      margin-right: 10px;
      display: flex;
      align-items: center;
      color: #fff;

      .labels {
        flex-shrink: 0;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
      }

      .zhuyao {
        color: #1890ff;
        font-size: 15px;
      }

      .ciyao {
        color: rgba(255, 255, 255, 0.8);
      }

      .warning {
        color: #e6a23c;
        font-size: 15px;
      }
    }

    .inner_right {
      position: relative;
      height: 100%;
      width: 380px;
      flex-shrink: 0;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;

      .dibu {
        position: absolute;
        height: 2px;
        width: 104%;
        background-image: url("../../assets/img/zuo_xuxian.png");
        bottom: -10px;
        left: -2%;
        background-size: cover;
      }

      .addresswrap {
        width: 100%;
        display: flex;
        margin-top: 8px;
      }
    }

    .wangguan {
      color: #1890ff;
      font-weight: 900;
      font-size: 15px;
      width: 80px;
      flex-shrink: 0;
    }

    .types {
      width: 50px;
      flex-shrink: 0;
      text-align: center;
    }

    .typeRed {
      color: #fc1a1a;
    }

    .typeGreen {
      color: #29fc29;
    }
  }
}
</style>
