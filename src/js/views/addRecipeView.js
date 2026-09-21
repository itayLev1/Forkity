// import { log10 } from "core-js/core/number";
import View from "./view.js";

class AddRecipeView extends View {
  _parentElement = document.querySelector('.upload');
  _message = 'Recipe was successfully uploaded :-)'
  _window = document.querySelector('.add-recipe-window:not(.auth-window)');
  _overlay = document.querySelector('.overlay');
  _btnOpen = document.querySelector('.nav__btn--add-recipe');
  _btnClose = document.querySelector('.add-recipe-window:not(.auth-window) .btn--close-modal');

  constructor() {
    super()
      this.addHandlerShowWindow();
      this.addHandlerHideWindow()
      this.addHandlerUpload()
  }

  openWindow() {
    this._overlay.classList.remove('hidden');
    this._window.classList.remove('hidden');
  }

  closeWindow() {
    this._overlay.classList.add('hidden');
    this._window.classList.add('hidden');
  }

  uploadRecipe
  
  addHandlerShowWindow() {
    this._btnOpen.addEventListener('click', this.openWindow.bind(this))
  }

  
  addHandlerHideWindow() {
    this._btnClose.addEventListener('click', this.closeWindow.bind(this))
    this._overlay.addEventListener('click', this.closeWindow.bind(this))
  }
  
  addHandlerUpload(handler) {
    this._parentElement.addEventListener('submit', function(e) {
      e.preventDefault();
      const dataArr = [...new FormData(this)]; // using deconstruction together with the spread operator will give the object in an array.
      // console.log(dataArr);
      const data = Object.fromEntries(dataArr)
      handler(data)
    })
  }
  
  generateMarkup() {
    
  }
}

export default new AddRecipeView();