/* global flatpickr */
import {BaseWidget} from './BaseWidget.js';
import {utils} from '../utils.js';
import {select, settings} from '../settings.js';

export class DatePicker extends BaseWidget
{
  constructor(wrapper)
  {
    super(wrapper, utils.dateToStr(new Date()));

    const thisWidget = this;
    
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);
    thisWidget.initPlugin();
    thisWidget.renderValue();
  }

  initPlugin()
  {
    const thisWidget = this;

    thisWidget.minDate = new Date (thisWidget.value);
    thisWidget.maxDate = utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture);
    thisWidget.options = 
    {
      'minDate': thisWidget.minDate,
      'maxDate': thisWidget.maxDate,
      'defaultDate': thisWidget.minDate,
      'disable': [
        function(date) {
          return (date.getDay() === 1);

        }
      ],
      'locale': {
        'firstDayOfWeek': 1,
      },
      onChange: function(selectedDates, dateStr) {
        thisWidget.value = dateStr;
      },
    };

    //const flatpickr = require('flatpickr');
    flatpickr(thisWidget.dom.input, thisWidget.options);
  }

  parseValue(newValue)
  {
    return newValue;
  }

  isValid()
  {
    return true;
  }

  renderValue()
  {
    //const thisWidget = this;

    //thisWidget.dom.input = thisWidget.value;
  }
}