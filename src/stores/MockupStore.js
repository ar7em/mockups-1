'use strict';

var EventEmitter = require('events').EventEmitter;

var ActionTypes = require('../constants/ActionTypes');
var assign = require('object-assign');
var MockupsAppDispatcher = require('../dispatcher/MockupsAppDispatcher');
var DropboxStore = require('./DropboxStore');

var CHANGE_EVENT = 'change';


var MockupStore = assign({}, EventEmitter.prototype, {

  currentMockup: null,

  /**
   * Creates new mockup
   */
  create() {
    DropboxStore.set({
      table: "mockups",
      data: {
        name: "New mockup"
      }
    });
  },

  /**
   * Changes name of given mockup
   *
   * @param {string} params.id Identifies mockup to be renamed
   * @param {string} params.name New name that shall be given to mockup
   */
  rename(params) {
    DropboxStore.set({
      table: "mockups",
      query: params.id,
      data: {
        name: params.name
      }
    });
  },

  /**
   * Removes a mockup
   *
   * @param {string} params.id Identifies mockup to be removed
   */
  remove(params) {
    DropboxStore.remove({
      table: "mockups",
      query: params.id
    });

    this.emitChange();
  },

  /**
   * Retrieves a list of mockups from dropbox
   */
  getMockups() {
    return DropboxStore.find({table: "mockups"});
  },

  /**
   * Sets mockup as current by provided data
   *
   * @param (Object) params
   * @param (String) params.mockupId Id of he mockup to set as current
   */
  selectMockup(params) {
    var foundMockup = null;

    if (params.mockupId) {
      var mockups = this.getMockups();
      for (var i = 0; i < mockups.length; i++) {
        var mockup = mockups[i];
        var id = mockup.getId();
        if (id === params.mockupId) {
          foundMockup = mockup;
          break;
        }
      }
    }

    if (foundMockup !== this.currentMockup) {
      this.currentMockup = foundMockup;
      this.emitChange();
    }
  },

  /**
   * Emits change event to all registered event listeners.
   *
   * @returns {Boolean} Indication if we've emitted an event.
   */
  emitChange() {
    return MockupStore.emit(CHANGE_EVENT);
  },

  /**
   * Register a new change event listener.
   *
   * @param {function} callback Callback function.
   */
  addChangeListener(callback) {
    MockupStore.on(CHANGE_EVENT, callback);
  },

  /**
   * Remove change event listener.
   *
   * @param {function} callback Callback function.
   */
  removeChangeListener(callback) {
    MockupStore.removeListener(CHANGE_EVENT, callback);
  }
});

MockupStore.dispatchToken = MockupsAppDispatcher.register(function(payload) {
  var action = payload.action;
  switch (action.type) {

    case ActionTypes.MOCKUP_RENAME:
    MockupStore.rename(action.data);
    break;

    case ActionTypes.MOCKUP_CREATE:
    MockupStore.create();
    break;

    case ActionTypes.MOCKUP_REMOVE:
    MockupStore.remove(action.data);
    break;

    case ActionTypes.APP_TRANSITION:
    MockupStore.selectMockup(action.data);
    break;

    case ActionTypes.MOCKUP_START_EDIT:
    MockupStore.selectMockup(action.data);
    break;

    default:
      // Do nothing
  }

});

module.exports = MockupStore; 
