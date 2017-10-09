<template>
  <div class="modal-wrapper">
    <div class="modal-container">
      <span class="close-icon" @click="$emit('close')"><i class="material-icons">close</i></span>
      <div class="modal-header">Edit Incoming Data Point Code</div>
      <div class="codeeditor-toolbox">
        <i v-on:click="saveCode" title="Save code for execution" class="material-icons toolbox-icon">save</i>
      </div>
      <p style="margin-before: 0;">Code here will be executed when a new data point comes in for this data sink. In this code you have
        access to the data as <i>data</i>, the component, its datasinks and sources, and the <i>fetch</i> method.</p>
      <div class="code-container-outer" id="codeContainer">
        <textarea style="width: 100%; height: calc(100% - 7rem);" placeholder="fetch(`http://localhost:3000/d/r/${sink.readKey}/${sink.title}?limit=10`).then(r => r.json()).then(d => { console.log(d); }).catch(console.log);" v-model="sinkCode"/>
      </div>
      <div style="position: absolute; bottom: 1rem; right: 1.5rem; display: inline-block; width:100%;">
        <button class="small-button" @click="$emit('close')" style="float: right;">{{buttonText}}</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'codeeditormodal',
  props: ['sink'],
  data() {
    return {
      sinkCode: '',
      buttonText: 'Cancel',
    }
  },
  computed: {
  },
  mounted() {
    this.sinkCode = this.$props.sink.definition;
  },
  methods: {
    saveCode() {
      this.$store.commit('saveSinkCode', { datasinkId: this.$props.sink.id, code: this.sinkCode });
      this.buttonText = 'Close';
      const body = JSON.stringify({
        id: this.$props.sink.id,
        definition: this.sinkCode,
      });
      fetch(`/api/datasinks/saveCode/`, { credentials: 'include', method: 'POST', body, headers: {'Content-Type': 'application/json'} }).then(() => {
        this.$store.commit('addAlert', { msg: 'Code saved for execution each time data point received.', type: 'success'});
      }).catch(() => {
        this.$store.commit('addAlert', { msg: 'Problem saving that code', type: 'error'});
      });
    },
  },
}
</script>

<style lang="scss" scoped>
@import "~assets/css/main.scss";
.modal-wrapper {
  position: fixed;
  top: 50%;
  transform: translate(-50%, -50%);
  left: 50%;
}
.modal-container {
  width: 50vw;
  height: 50vh;
  overflow: hidden;
  margin: 0px auto;
  padding: 1rem 1.5rem;
  background-color: #fff;
  border-radius: 2px;
  border: 2px solid black;
  transition: all .3s ease;
  font-family: Roboto Slab, serif;
  text-align: left;
  position: relative;
}
.close-icon {
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  color: $icon-base-color;
  cursor: pointer;
}
.modal-header {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: $primary-text;
  font-weight: 900;
}
.codeeditor-toolbox {
  background-color: #eee;
  padding: 0.2rem 0.5rem;
  margin: 0.5rem 0;
  position: relative;
  display: inline-block;
  width: 100%;
  .toolbox-icon {
    position: relative;
    float: right;
    color: $primary-text;
    cursor: pointer;
  }
  .toolbox-icon:hover {
    color: lightgray;
  }
}
.code-container-outer {
  overflow: hidden;
  position: relative;
  height: calc(100% - 5rem);
  white-space: nowrap;
}
.datasink-table {
  padding-left: 0.5rem;
  width: 100%;
  font-family: "Source Sans Pro", sans-serif;
}
.inline-icon {
  i {
    font-size: 1rem;
    top: 2px;
    position: relative;
    cursor: pointer;
    color: gray;
  }
  i:hover {
    color: black;
  }
}
.listing-url {
  font-size: 0.8rem;
}
</style>
