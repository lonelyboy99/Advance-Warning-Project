<template>
  <div style="padding: 40px 0 0 0;">
    <t-slider
        v-model="sliderValue1"
        :inputNumberProps="inputNumberProps1"
        @change="handleSliderChange('led/emqx', '1', $event)"
        :show-tooltip="true"
        :marks="marks1"
    />
    <br />
    <br />
    <t-slider
        v-model="sliderValue2"
        :inputNumberProps="inputNumberProps2"
        @change="handleSliderChange('led/emqx', '2', $event)"
        :show-tooltip="true"
        :marks="marks2"
        :max="max"
    />
    <br />
    <br />
    <div class="light-container">
      <t-button class="light-item" @click="setLightLevel(1, 10)">一档</t-button>
      <t-button class="light-item" @click="setLightLevel(1, 40)">二档</t-button>
      <t-button class="light-item" @click="setLightLevel(1, 70)">三档</t-button>
      <t-button class="light-item" @click="setLightLevel(1, 100)">四档</t-button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['publish'],
  data() {
    return {
      inputNumberProps1: {
        size: 'large',
      },
      inputNumberProps2: {
        size: 'large',
      },
      sliderValue1: 0,
      sliderValue2: 0,
      sliderChangeTimeout1: null,
      sliderChangeTimeout2: null,
      // 刻度标记配置
      marks1: {
        0: '0%',
        25: '20%',
        50: '40%',
        75: '60%',
        100: '100%',
      },
      marks2: {
        0: '0',
        2000: '2kHz',
        4000: '4kHz',
        6000: '6kHz',
        8000: '8kHz',
      },
      max:8000
    };
  },
  methods: {
    handleSliderChange(topic, sliderIdentifier, value) {
      const sliderChangeTimeout = this[`sliderChangeTimeout${sliderIdentifier}`];
      if (sliderChangeTimeout) {
        clearTimeout(sliderChangeTimeout);
      }

      this[`sliderChangeTimeout${sliderIdentifier}`] = setTimeout(() => {
        let message = {};
        if (sliderIdentifier === '1') {
          message = { led: value };
        } else if (sliderIdentifier === '2') {
          message = { freq: value };
        }
        this.publish(topic, JSON.stringify(message));
      }, 1000);
    },

    setLightLevel(sliderIdentifier, level) {
      if (sliderIdentifier === 1) {
        this.sliderValue1 = level;
      }
      //  else if (sliderIdentifier === 2) {
      //   this.sliderValue2 = level;
      // }
      this.handleSliderChange('led/emqx', sliderIdentifier.toString(), level);
    },
  },
};
</script>

<style>
.light-container {
  display: flex;
  width: 100%;
  justify-content: space-around;
}
.light-item {
  flex-basis: 100px;
}
.t-slider__mark-text {
  color: white; /* 自定义颜色 */
  font-size: 15px;
}
.t-input__wrap {
  width: auto;
  display: flex;
  flex-direction: row;
}
</style>
