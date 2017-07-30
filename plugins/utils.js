module.exports = {
  getUuid: () => {
    return (new Date().getTime()).toString(36);
  },
  flashSave: () => {
    let saveButton = document.getElementById('save-dash-button');
    saveButton.style['filter'] = 'drop-shadow(0 0 7px red)';
    setTimeout(() => {
      saveButton.style['filter'] = '';
    }, 1000);
  },
};
