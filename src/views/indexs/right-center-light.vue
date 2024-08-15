<template>
  <div style="padding: 20px 0 0 140px" class="container">
    <input type="checkbox" id="checkbox" :checked="checked" @click="clickHandle()" ref="checkbox"/>
    <label for="checkbox" class="switch">
      <span style="font-size: 50px">{{State}}</span>
      <svg
          class="slider"
          viewBox="0 0 512 512"
          height="5em"
          xmlns="http://www.w3.org/2000/svg"
      >
        <path
            d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V256c0 17.7 14.3 32 32 32s32-14.3 32-32V32zM143.5 120.6c13.6-11.3 15.4-31.5 4.1-45.1s-31.5-15.4-45.1-4.1C49.7 115.4 16 181.8 16 256c0 132.5 107.5 240 240 240s240-107.5 240-240c0-74.2-33.8-140.6-86.6-184.6c-13.6-11.3-33.8-9.4-45.1 4.1s-9.4 33.8 4.1 45.1c38.9 32.3 63.5 81 63.5 135.4c0 97.2-78.8 176-176 176s-176-78.8-176-176c0-54.4 24.7-103.1 63.5-135.4z"
        ></path>
      </svg>
    </label>
  </div>

</template>

<script>
export default {
  props: ['publish'],
  data() {
    return {
      checked:"",
      State:"接通",
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
    };
  },
  methods: {
    clickHandle() {
      let message;
      if (this.checked === "checked" && this.State === "断开") {
        message = Buffer.from([0x00]);
        this.publish("transparent/req", message);
        this.checked = "";
        this.State = "接通";
      } else {
        message = Buffer.from([0x01]);
        this.publish("transparent/req", message);
        this.checked = "checked";
        this.State = "断开";
      }
    },
    handleSliderChange(topic, sliderIdentifier, value) {
      console.log(this.$refs.checkbox.checked);
      const sliderChangeTimeout = this[`sliderChangeTimeout${sliderIdentifier}`];
      if (sliderChangeTimeout) {
        clearTimeout(sliderChangeTimeout);
      }

      this[`sliderChangeTimeout${sliderIdentifier}`] = setTimeout(() => {
        let message = {};
        if (sliderIdentifier === '1') {
          message = {led: value};
        } else if (sliderIdentifier === '2') {
          message = {freq: value};
        }
        this.publish(topic, JSON.stringify(message));
      }, 1000);
    },

  },
};
</script>

<style scoped>
.light-container {
  display: flex;
  width: 100%;
  justify-content: space-around;
}

.light-item {
  flex-basis: 100px;
}

.t-slider__mark-text {
  color: rgba(163, 209, 255, 0.8); /* Light blue color matching the nebula */
  font-size: 15px;
}

.t-input__wrap {
  width: auto;
  display: flex;
  flex-direction: row;
}

#checkbox {
  display: none;
}

.switch {
  position: relative;
  width: fit-content;
  padding: 10px 20px;
  background-color: rgba(10, 20, 30, 0.9); /* Dark blue background with a slight transparency */
  border-radius: 50px;
  z-index: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: rgba(163, 209, 255, 0.8); /* Light blue text */
  font-size: 0.9em;
  font-weight: 600;
  transition: all 0.3s;
}

.switch svg path {
  fill: rgba(163, 209, 255, 0.8); /* Light blue color matching the nebula */
}

#checkbox:checked + .switch {
  background-color: rgba(20, 40, 60, 0.9); /* Slightly brighter blue when checked */
  box-shadow: 0px 0px 40px rgba(163, 209, 255, 0.5); /* Light blue glow */
}

</style>
