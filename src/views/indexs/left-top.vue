<template>
  <ul class="user_Overview flex" v-if="pageflag">
    <li class="user_Overview-item" style="color: #00fdfa">
      <div class="user_Overview_nums allnum">
        <dv-digital-flop :config="ch2TemperatureConfig" style="width:100%;height:100%;"/>
      </div>
      <p>A相谐波电压V</p>
    </li>
    <li class="user_Overview-item" style="color: #07f7a8">
      <div class="user_Overview_nums online">
        <dv-digital-flop :config="ch3TemperatureConfig" style="width:100%;height:100%;"/>
      </div>
      <p>Ia相电流A</p>
    </li>
    <li class="user_Overview-item" style="color: #e3b337">
      <div class="user_Overview_nums offline">
        <dv-digital-flop :config="ch1CurrentConfig" style="width:100%;height:100%;"/>
      </div>
      <p>总电量KW·h</p>
    </li>
    <li class="user_Overview-item" style="color: #f5023d">
      <div class="user_Overview_nums laramnum">
        <dv-digital-flop :config="ch1PowerConfig" style="width:100%;height:100%;"/>
      </div>
      <p>三相不平衡度</p>
      <!-- 详细数据按钮 -->
      <div @click="visible = true" class="chart-link">详细数据</div>
      <TransparentModal
          :visible="visible"
          title="探测器详细数据"
          @close="visible = false"
          width="90%"
          height="90%"
      >
        <t-row :gutter="[16, 16]">
          <t-col v-for="(key, index) in Object.keys(snapData)" :key="index" :xl="2" :xs="6">
            <t-card :bordered="false" :title="keyToChinese[key]">
              {{ snapData[key] }}
            </t-card>
          </t-col>
        </t-row>
      </TransparentModal>
    </li>
  </ul>
</template>

<script>
import { GET } from "@/api";
import TransparentModal from './TransparentModal.vue'; // 引入透明背景的弹窗组件

export default {
  components: {
    TransparentModal,
  },
  data() {
    return {
      ch2Temperature: null, // CH2温度数据
      ch3Temperature: null, // CH3温度数据
      ch1Current: null, // CH1电流数据
      ch1Power: null, // CH1功率数据
      pageflag: true,
      visible: false,
      snapData: {},// 保存从接口获取的数据
      keyToChinese: {
        Va: "A相电压",
        Vb: "B相电压",
        Vc: "C相电压",
        Uab: "线电压Uab",
        Ubc: "线电压Ubc",
        Uca: "线电压Uca",
        Ia: "A相电流",
        Ib: "B相电流",
        Ic: "C相电流",
        Pa: "A相有功功率（W）",
        Pb: "B相有功功率（W）",
        Pc: "C相有功功率（W）",
        Qa: "A相无功功率（Var）",
        Qb: "B相无功功率（Var）",
        Qc: "C相无功功率（Var）",
        Sa: "A相视在功率（VA）",
        Sb: "B相视在功率（VA）",
        Sc: "C相视在功率（VA）",
        AllP: "总有功功率（W）",
        AllQ: "总无功功率（Var）",
        AllS: "总视在功率（VA）",
        AllE: "总电量（KW·h）",
        GridF: "电网频率（Hz）",
        HIA: "A相谐波电流",
        HIB: "B相谐波电流",
        HIC: "C相谐波电流",
        HUA: "A相谐波电压",
        HUB: "B相谐波电压",
        HUC: "C相谐波电压",
        PfA: "A相功率因数",
        PfB: "B相功率因数",
        PfC: "C相功率因数",
        Unbalance: "三相不平衡度",
        IaCT: "A相电流CT倍率",
        IbCT: "B相电流CT倍率",
        IcCT: "C相电流CT倍率",
      }
    };
  },
  mounted() {
    this.fetchTempData();
    this.updateInterval = setInterval(() => {
      this.fetchTempData();
    }, 10000); // 每10秒更新一次
  },
  beforeDestroy() {
    clearInterval(this.updateInterval);
  },
  methods: {
    async fetchTempData() {
      try {
        const res = await GET('/api/Temp');
        const res1 = await GET('/api/deviceParams');
        console.log('API 返回的数据:', res, res1);  // 添加调试日志

        if (res.success && res1.success) {
          const seriesData = res.data.seriesData;
          const snapData = res1.data.snap;

          // 设置页面显示的数据
          this.ch2Temperature = res1.data.snap.HUA;  // 设置A相谐波电压
          this.ch3Temperature = res1.data.snap.Ia;   // 设置Ia相电流
          this.ch1Current = res1.data.snap.AllE;     // 设置总电量
          this.ch1Power = res1.data.snap.Unbalance;  // 设置三相不平衡度

          // 保存 snap 数据用于弹窗中的显示
          this.snapData = {
            Va: snapData.Va,
            Vb: snapData.Vb,
            Vc: snapData.Vc,
            Uab: snapData.Uab,
            Ubc: snapData.Ubc,
            Uca: snapData.Uca,
            Ia: snapData.Ia,
            Ib: snapData.Ib,
            Ic: snapData.Ic,
            Pa: snapData.Pa,
            Pb: snapData.Pb,
            Pc: snapData.Pc,
            Qa: snapData.Qa,
            Qb: snapData.Qb,
            Qc: snapData.Qc,
            Sa: snapData.Sa,
            Sb: snapData.Sb,
            Sc: snapData.Sc,
            AllP: snapData.AllP,
            AllQ: snapData.AllQ,
            AllS: snapData.AllS,
            AllE: snapData.AllE,
            GridF: snapData.GridF,
            HIA: snapData.HIA,
            HIB: snapData.HIB,
            HIC: snapData.HIC,
            HUA: snapData.HUA,
            HUB: snapData.HUB,
            HUC: snapData.HUC,
            PfA: snapData.PfA,
            PfB: snapData.PfB,
            PfC: snapData.PfC,
            Unbalance: snapData.Unbalance,
            IaCT: snapData.IaCT,
            IbCT: snapData.IbCT,
            IcCT: snapData.IcCT,

          };
        } else {
          console.error('获取设备参数数据失败:', res.message);
        }
      } catch (error) {
        console.error('API调用失败:', error);
      }
    },
    close() {
      this.visible = false;
    }
  },
  computed: {
    ch2TemperatureConfig() {
      return {
        number: this.ch2Temperature != null ? [this.ch2Temperature] : [0],
        content: '{nt}',
        toFixed: 2,
        style: {
          fontSize: 24,
          fill: "#00fdfa",
        },
      };
    },
    ch3TemperatureConfig() {
      return {
        number: this.ch3Temperature != null ? [this.ch3Temperature] : [0],
        content: '{nt}',
        style: {
          fontSize: 24,
          fill: "#07f7a8",
        },
      };
    },
    ch1CurrentConfig() {
      return {
        number: this.ch1Current != null ? [this.ch1Current] : [0],
        content: '{nt}',
        style: {
          fontSize: 24,
          fill: "#e3b337",
        },
      };
    },
    ch1PowerConfig() {
      return {
        number: this.ch1Power != null ? [this.ch1Power] : [0],
        content: '{nt}',
        toFixed: 2,
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
.custom-dialog {
  .t-dialog__modal-default {
    background-color: transparent !important; // 设为透明背景
    box-shadow: none !important; // 移除阴影
    border: none !important; // 移除边框
  }

  .t-dialog__mask {
    background-color: rgba(0, 0, 0, 0.5) !important; // 如果需要修改遮罩层的背景色
  }
}

.t-card {
  background: linear-gradient(135deg, #1e3c72 40%, #2a5298 100%) !important;
  color: #ffffff !important;
  font-size: 30px;
}

.t-card__title {
  font: var(--td-font-title-medium);
  color: #fff;
  margin-right: var(--td-comp-margin-l);
  word-break: break-all;
}

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
      margin: 20px auto 30px;
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

  .details-button {
    position: absolute;
    bottom: 40px;
    right: 10px;
    padding: 20px 0 0 0;
    font-size: 15px;
    color: #02a8f5;
    cursor: pointer;
    background-color: transparent;

    &:hover {
      color: #e8dbdf;
    }
  }
  .chart-link { /* 放大查看图表的文字链接样式 */
    position: absolute;
    bottom: 7px; /* 距离底部10px */
    right: 10px; /* 距离右边10px */
    color: #3498db; /* 文字颜色 */
    cursor: pointer; /* 鼠标悬停时显示指针 */
    font-size: 14px; /* 文字大小 */

    &:hover {
      color: #2980b9; /* 悬停时的颜色 */
    }
  }
}
</style>
