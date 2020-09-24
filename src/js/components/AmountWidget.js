import {select, settings} from '../settings.js';

export class AmountWidget
{
  constructor(element)
  {
    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.value = settings.amountWidget.defaultValue;
    thisWidget.setValue(thisWidget.value);
    thisWidget.initActions();
    //console.log('AmountWidget:', thisWidget);
    //console.log('constructor arguments:', element);
  }

  getElements(element)
  {
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value)
  {
    const thisWidget = this;

    const newValue = parseInt(value);
    const oldValue = parseInt(thisWidget.value);

    /* TODO Add validation */

    if(newValue != oldValue && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax)
    {  
      thisWidget.value = newValue;
      thisWidget.announce();
    }
    thisWidget.input.value = thisWidget.value;
  }

  initActions()
  {
    const thisWidget = this;

    //const oldValue = parseInt(thisWidget.input.value);
    thisWidget.input.addEventListener('change', function()
    {
      const newValue = parseInt(thisWidget.input.value);
      thisWidget.setValue(newValue);
    });

    thisWidget.linkDecrease.addEventListener('click', function(event)
    {
      event.preventDefault();
      const oldValue = parseInt(thisWidget.input.value);
      const newValue = oldValue - 1;
      thisWidget.setValue(newValue);
    });

    thisWidget.linkIncrease.addEventListener('click', function(event)
    {
      event.preventDefault();
      const oldValue = parseInt(thisWidget.input.value);
      const newValue = oldValue + 1;
      thisWidget.setValue(newValue);
    });
  }

  announce()
  {
    const thisWidget = this;

    const event = new CustomEvent('update',
      {
        bubbles: true
      });
    thisWidget.element.dispatchEvent(event);
  }
}