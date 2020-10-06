import {select, settings} from '../settings.js';
import {BaseWidget} from './BaseWidget.js';

export class AmountWidget extends BaseWidget
{
  constructor(wrapper, interval)
  {
    super(wrapper, settings.amountWidget.defaultValue, interval);

    const thisWidget = this;
  
    thisWidget.getElements();
    thisWidget.initActions();
    thisWidget.renderValue();
  }

  getElements()
  {
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  isValid(newValue)
  {
    return !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin 
    && newValue <= settings.amountWidget.defaultMax;
  }

  initActions()
  {
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function()
    {
      thisWidget.value = thisWidget.dom.input.value;
    });

    thisWidget.dom.linkDecrease.addEventListener('click', function(event)
    {
      event.preventDefault();
      thisWidget.value = thisWidget.value - thisWidget.interval;
    });

    thisWidget.dom.linkIncrease.addEventListener('click', function(event)
    {
      event.preventDefault();
      thisWidget.value = thisWidget.value + thisWidget.interval;
    });
  }

  renderValue()
  {
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

  parseValue(newValue)
  {
    return parseFloat(newValue);
  }
}