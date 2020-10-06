export class BaseWidget
{
  constructor(wrapperElement, initialValue, interval)
  {
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;
    thisWidget.correctValue = initialValue;
    thisWidget.interval = interval;
  }

  get value()
  {
    const thisWidget = this;

    return thisWidget.correctValue;
  }

  set value(assignedValue)
  {
    const thisWidget = this;

    const newValue = thisWidget.parseValue(assignedValue);

    if(newValue != thisWidget.correctValue && thisWidget.isValid(newValue))
    {
      thisWidget.correctValue = newValue;
      thisWidget.announce();
    }

    thisWidget.renderValue();
  }

  parseValue(newValue)
  {
    return parseInt(newValue);
  }

  isValid(newValue)
  {
    return !isNaN(newValue);
  }

  renderValue()
  {
    const thisWidget = this;

    console.log('widget value: ', thisWidget.value);
  }

  announce()
  {
    const thisWidget = this;

    const event = new CustomEvent('update', 
      {
        bubbles: true,
      });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}