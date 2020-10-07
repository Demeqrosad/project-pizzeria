import {select, classNames, templates, settings} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';

export class Product
{
  constructor(id, data)
  {
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();


    //console.log('new Product: ', thisProduct);
  }

  renderInMenu()
  {
    const thisProduct = this;

    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);

    /* create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);

    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements()
  {
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion()
  {
    const thisProduct = this;
    /* find the clickable trigger (the element that should react to clicking) */
    //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    /* START: click event listener to trigger */
    thisProduct.accordionTrigger.addEventListener('click', function()
    {
      /* prevent default action for event */
      event.preventDefault();
      /* toggle active class on element of thisProduct */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      /* find all active products */
      const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
      /* START LOOP: for each active product */
      for(let activeProduct of activeProducts)
      {
        /* START: if the active product isn't the element of thisProduct */
        if(activeProduct != thisProduct.element)
        {
          /* remove class active for the active product */
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        /* END: if the active product isn't the element of thisProduct */
        }
      /* END LOOP: for each active product */
      }
    /* END: click event listener to trigger */
    });
  }

  initOrderForm()
  {
    const thisProduct = this;

    thisProduct.form.addEventListener('submit', function(event)
    {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.formInputs)
    {
      input.addEventListener('change', function()
      {
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function(event)
    {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  initAmountWidget()
  {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem, settings.amountWidget.defaultInterval, settings.amountWidget.defaultMin, settings.amountWidget.defaultMax);
    thisProduct.amountWidgetElem.addEventListener('update', function()
    {
      thisProduct.processOrder();
    });
  }

  processOrder()
  {
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.form);
    //console.log('formData', formData);
    thisProduct.params = {};
    /* fetch current price of thisProduct */
    let price = thisProduct.data.price;
    //console.log('Current price: ', price);
    /* START LOOP: for each param */
    const params = thisProduct.data.params;
    //console.log('Params: ', params);
    for(let param in params)
    {
      /* START LOOP: for each option */
      const options = thisProduct.data.params[param].options;
      //console.log('Options of ' + param + ':', options);
      for(let option in options)
      {
        /* Check if option is checked*/
        const isDefault = thisProduct.data.params[param].options[option].default;
        const optionPrice = thisProduct.data.params[param].options[option].price;
        //console.log('formData: ', formData[param]);
        const isChecked = (formData.hasOwnProperty(param) && formData[param].indexOf(option) > -1);
        if(isChecked)
        {
          /* Check if option is not default */
          if(!isDefault)
          {
            price = price + optionPrice;
          }
        }
        else
        {
          /* Check if not checked option is default */
          if(isDefault)
          {
            price = price - optionPrice;
          }
        }
        const images = thisProduct.imageWrapper.querySelectorAll('.' + param + '-' + option);
        //console.log('Images: ', images);
        if(isChecked)
        {
          if(!thisProduct.params[param])
          {
            thisProduct.params[param] = 
            {
              label: thisProduct.data.params[param].label,
              options: {},
            };
          }
          thisProduct.params[param].options[option] = thisProduct.data.params[param].options[option].label;
          for(let image of images)
          {
            image.classList.add(classNames.menuProduct.imageVisible);
          }
        }
        else
        {
          for(let image of images)
          {
            image.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      /* END LOOP: for each option */
      }
    /* END LOOP: for each param */
    }
    /* Update current price*/
    //console.log('Final price: ', price);
    /* Multiply price by amount */
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
    thisProduct.priceElem.innerHTML = thisProduct.price;
    //console.log(thisProduct.params);
  }

  addToCart()
  {
    const thisProduct = this;
    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;
    //app.cart.add(thisProduct);
    const event = new CustomEvent('add-to-cart',
      {
        bubbles: true,
        detail:
        {
          product: thisProduct,
        },
      });
    thisProduct.element.dispatchEvent(event);
  }
}