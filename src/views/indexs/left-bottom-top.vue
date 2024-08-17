<!--
 * @Author: daidai
 * @Date: 2022-03-01 15:51:43
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-29 15:12:46
 * @FilePath: \web-pc\src\pages\big-screen\view\indexs\right-bottom.vue
-->
<template>
  <div class="right_bottom">
    <dv-capsule-chart :config="config" style="width:100%;height:260px" />
  </div>
</template>

<script>
import { currentGET } from 'api/modules';


export default {
  data() {
    return {
      gatewayno: '',
      config: {
        showValue: true,
        unit: "",
        data: []
      },
      allData: [],  // 用于存储从接口获取的所有数据
      currentIndex: 0,  // 当前显示数据的起始索引
    };
  },
  created() {
    this.getData();
  },
  mounted() {
    this.startInterval();
  },
  beforeDestroy() {
    this.clearData();
  },
  methods: {
    clearData() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    startInterval() {
      this.timer = setInterval(() => {
        this.updateDisplayedData();
      }, 5000);  // 每5秒更新一次显示的数据
    },
    getData() {
      this.pageflag = true;
      currentGET('device', {}).then(res => {

        if (res.success) {
          const snap = res.data.snap;

          this.allData = [
            { name: 'A相电流', value: snap.Ia },
            { name: 'B相电流', value: snap.Ib },
            { name: 'C相电流', value: snap.Ic },
            { name: 'A相有功功率', value: snap.Pa },
            { name: 'B相有功功率', value: snap.Pb },
            { name: 'C相有功功率', value: snap.Pc },
            { name: '三相不平衡度', value: snap.Unbalance },
            { name: 'A相谐波电压', value: snap.HUA },
            { name: 'B相谐波电压', value: snap.HUB },
            { name: 'C相谐波电压', value: snap.HUC },
            { name: '总视在功率', value: snap.AllS },
            { name: '总无功功率', value: snap.AllQ },
            { name: 'A相谐波电流', value: snap.HIA },
            { name: 'B相谐波电流', value: snap.HIB },
            { name: 'C相谐波电流', value: snap.HIC },
            { name: 'A相电压', value: snap.Va },
            { name: 'B相电压', value: snap.Vb },
            { name: 'C相电压', value: snap.Vc },
            { name: '线电压Uab', value: snap.Uab },
            { name: '线电压Ubc', value: snap.Ubc },
            { name: '线电压Uca', value: snap.Uca },
          ];

          console.log('获取的所有数据:', this.allData);  // 添加调试信息

          // 初始化显示数据
          this.updateDisplayedData();
        } else {
          this.pageflag = false;
          this.$Message({
            text: res.msg,
            type: 'warning'
          });
        }
      }).catch(error => {
        console.error('API调用失败:', error);
      });
    },

    updateDisplayedData() {
      // 计算当前要显示的数据
      const endIndex = this.currentIndex + 7;
      const dataToDisplay = this.allData.slice(this.currentIndex, endIndex);

      console.log('当前显示的数据:', dataToDisplay);  // 添加调试信息
      this.config={
        ...this.config,
        data:dataToDisplay
      }

      // 如果已经到达数组末尾，则从头开始
      if (endIndex >= this.allData.length) {
        this.currentIndex = 0;
      } else {
        this.currentIndex += 7;
      }
    },
  },
};

</script>
<style lang='scss' scoped>
.list_Wrap {
  height: 100%;
  overflow: hidden;
  :deep(.kong)   {
    width: auto;
  }
}

.sbtxSwiperclass {
  .img_wrap {
    overflow-x: auto;
  }

}

.right_bottom {
  box-sizing: border-box;
  padding: 0 16px;

  .searchform {
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;

    .searchform_item {
      display: flex;
      justify-content: center;
      align-items: center;

      label {
        margin-right: 10px;
        color: rgba(255, 255, 255, 0.8);
      }

      button {
        margin-left: 30px;
      }

      input {}
    }
  }

  .img_wrap {
    display: flex;
    // justify-content: space-around;
    box-sizing: border-box;
    padding: 0 0 20px;
    // overflow-x: auto;

    li {
      width: 105px;
      height: 137px;
      border-radius: 6px;
      overflow: hidden;
      cursor: pointer;
      // background: #84ccc9;
      // border: 1px solid #ffffff;
      overflow: hidden;
      flex-shrink: 0;
      margin: 0 10px;

      img {
        flex-shrink: 0;
      }
    }




  }

  .noData {
    width: 100%;
    line-height: 100px;
    text-align: center;
    color: rgb(129, 128, 128);

  }
}
</style>