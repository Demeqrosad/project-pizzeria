import {select, settings} from '../settings.js';
import {AmountWidget} from './AmountWidget.js';

export class CartProduct
{
  constructor(menuProduct, element)
  {
    const thisCartProduct = this;
    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));

    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();
    //console.log('thisCartProduct: ', thisCartProduct);
  }

  getElements(element)
  {
    const thisCartProduct = this;

    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element.querySelector(select.cartProduct.listElem);
    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
  }

  initAmountWidget()
  {
    const thisCartProduct = this;

    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget, settings.amountWidget.defaultValue, settings.amountWidget.defaultInterval, settings.amountWidget.defaultMin, settings.amountWidget.defaultMax);
    console.log('thisCartProduct.amount: ', thisCartProduct.amount);
    thisCartProduct.amountWidget.value = thisCartProduct.amount;
    thisCartProduct.dom.amountWidget.addEventListener('update', function()
    {
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;

    });
  }

  remove()
  {
    const thisCartProduct = this;

    const event = new CustomEvent('remove',
      {
        bubbles: true,
        detail: {cartProduct: thisCartProduct},
      });

    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }

  initActions()
  {
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function(event)
    {
      event.preventDefault();
    });

    thisCartProduct.dom.remove.addEventListener('click', function(event)
    {
      event.preventDefault();
      thisCartProduct.remove();
    });
  }

  getData()
  {
    const thisCartProduct = this;

    const cartProduct = {};
    cartProduct.id = thisCartProduct.id;
    cartProduct.amount = thisCartProduct.amount;
    cartProduct.price = thisCartProduct.price;
    cartProduct.priceSingle = thisCartProduct.priceSingle;
    cartProduct.params = thisCartProduct.params;

    return cartProduct;
  }
}