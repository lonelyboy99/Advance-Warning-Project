<template>
  <div
      v-if="pageflag"
      class="left_boottom_wrap beautify-scroll-def"
      :class="{ 'overflow-y-auto': !sbtxSwiperFlag }"
  >
    <component :is="components" :data="list" :class-option="defaultOption">
      <ul class="left_boottom">
        <li class="left_boottom_item" v-for="(item, i) in list" :key="i">
          <span class="orderNum doudong">{{ i + 1 }}</span>
          <div class="inner_right">
            <div class="dibu"></div>
            <div class="flex">
              <div class="info">
                <span class="labels">烟雾传感器ID：</span>
                <span class="contents zhuyao doudong wangguan">
                  {{ item.serialNumber }}</span>
              </div>
              <div class="info">
                <span class="labels">时间：</span>
                <span class="contents " style="font-size: 12px">
                  {{ item.masterLastCommTime }}</span>
              </div>
            </div>

            <span
                class="types doudong"
                :class="{
                typeRed: item.masterOnline === 0,
                typeGreen: item.masterOnline === 1,
              }"
            >{{ item.masterOnline === 1 ? "在线" : "离线" }}</span
            >
            <div class="flex">
              <div class="info addresswrap">
                <span class="labels">当前温度：</span>
                <span class="contents zhuyao doudong wangguan" style="font-size: 20px">
                {{ item.currentValue }}</span
                >
              </div>
              <div class="info addresswrap">
                <span class="labels">高温报警阈值：</span>
                <span class="contents ciyao" style="font-size: 12px">
                {{ item.maxValue }}</span
                >
              </div>
              <div class="info addresswrap">
                <span class="labels">低温报警阈值：</span>
                <span class="contents ciyao" style="font-size: 12px">
                {{ item.lowValue }}</span
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
      currentGET("big3", {limitNum: 20}).then((res) => {
        console.log("设备提醒", res);
        if (res.success) {
          this.list = res.data;
          let timer = setTimeout(() => {
            clearTimeout(timer);
            this.defaultOption.step =
                this.$store.state.setting.defaultOption.step;
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
  },
};
</script>

<style lang='scss' scoped>
.left_boottom_wrap {
  overflow: hidden;
  width: 100%;
  height: 100%;
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

.left_boottom {
  width: 100%;
  height: 100%;

  .left_boottom_item {
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
      width: 30px;
      flex-shrink: 0;
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
