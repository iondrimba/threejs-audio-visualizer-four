class Loader {
  constructor() {
    this.callback = null;
  }

  load(file) {
    const request = new XMLHttpRequest();

    request.open('GET', file, true);
    request.onprogress = (evt) => {
      let percent = Math.floor((evt.loaded / evt.total) * 100);

      this.callback(percent);
    };

    request.onload = () => {
      this.complete(file);
    };

    request.send();
  }

  progress(callback) {
    this.callback = callback;
  }

  complete() { }
}

export default Loader;
