import {select, templates, settings, classNames} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';
import {DatePicker} from './DatePicker.js';
import {HourPicker} from './HourPicker.js';

export class Booking
{
  constructor(element)
  {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  render(element)
  {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.tablesPrebooked = [];
    for(let table of thisBooking.dom.tables)
    {
      table.addEventListener('click', function(event)
      {
        event.preventDefault();

        /* Start reseting all prebookings */
        for(let otherTable of thisBooking.dom.tables)
        {
          if(otherTable !== table)
          {
            thisBooking.managePrebooking(otherTable, 'reset');
          }
        }
        /* End reseting all prebookings */

        if(!event.target.classList.contains(classNames.booking.tableBooked))
        {
          const action = 'toggle';
          thisBooking.managePrebooking(table, action);
        }
      }); 	
    }
    thisBooking.dom.submitButton = thisBooking.dom.wrapper.querySelector(select.booking.submitButton);
    thisBooking.dom.submitButton.addEventListener('click', function(event)
    {
      event.preventDefault();
      thisBooking.manageBooking();
    });

  }

  initWidgets()
  {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount, settings.amountWidget.defaultInterval);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount, settings.hours.interval);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.dom.wrapper.addEventListener('update', function()
    {
      thisBooking.updateDOM();
    });
  }

  getData()
  {
    const thisBooking = this;

    const startEndDates = {};
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(thisBooking.datePicker.minDate);
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(thisBooking.datePicker.maxDate);

    const endDate = {};
    endDate[settings.db.dateEndParamKey] = startEndDates[settings.db.dateEndParamKey];

    const params = {
      booking: utils.queryParams(startEndDates),
      eventsCurrent: settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate),
    };

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };

    console.log('getData urls', urls);

    console.log('getData params', params);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function([bookingsResponse, eventsCurrentResponse, eventsRepeatResponse]){
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat)
  {
    const thisBooking = this;

    thisBooking.booked = {};
    console.log('bookings: ', bookings);
    console.log('eventsCurrent: ', eventsCurrent);
    console.log('eventsRepeat: ', eventsRepeat);

    for(let event of eventsCurrent)
    {
      thisBooking.makeBooked(event.date, event.hour, event.duration, event.table);
    }
    
    for(let event of bookings)
    {
      thisBooking.makeBooked(event.date, event.hour, event.duration, event.table);
    }
    
    const minDate = new Date();
    const minDateStr = utils.dateToStr(minDate);
    for(let event of eventsRepeat)
    {
      const eventDate = new Date(event.date);
      for(let i=0; i<settings.datePicker.maxDaysInFuture; i++)
      {
        const currentDate = utils.dateToStr(utils.addDays(minDateStr, i));
        const actualDate = new Date(currentDate);
        if(eventDate <= actualDate)
        {
          thisBooking.makeBooked(currentDate, event.hour, event.duration, event.table);
        }
      }
    }
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table)
  {
    const thisBooking = this;

    if(!thisBooking.booked.hasOwnProperty(date))
    {
      const bookedDetails = {};
      const tables = [];
      let startHour = utils.hourToNumber(hour);
      tables.push(table);
      for(let i=0; i<duration; i=i+settings.hours.interval)
      {
        bookedDetails[startHour] = [];
        bookedDetails[startHour].push(tables[0]);
        startHour = startHour + settings.hours.interval;
      }
      thisBooking.booked[date] = bookedDetails;
    }
    else
    {
      const bookedDetails = thisBooking.booked[date];
      const tables = [];
      let startHour = utils.hourToNumber(hour);
      tables.push(table);
      for(let i=0; i<duration; i=i+settings.hours.interval)
      {
        if(!bookedDetails.hasOwnProperty(startHour))
        {
          bookedDetails[startHour] = [];
          bookedDetails[startHour].push(tables[0]);
        }
        else
        {
          bookedDetails[startHour].push(table);
        }
        startHour = startHour + settings.hours.interval;
      }
    }
  }

  updateDOM()
  {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    for(let table of thisBooking.dom.tables)
    {
      thisBooking.managePrebooking(table, 'reset');
      const tableId = parseInt(table.getAttribute(settings.booking.tableIdAttribute));
      if(thisBooking.booked.hasOwnProperty(thisBooking.date)
      && thisBooking.booked[thisBooking.date].hasOwnProperty(thisBooking.hour)
      && thisBooking.booked[thisBooking.date][thisBooking.hour].indexOf(tableId) > -1)
      {
        table.classList.add(classNames.booking.tableBooked);
      }
      else
      {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  managePrebooking(element, action)
  {
    const thisBooking = this;
    const tableNumber = element.getAttribute(settings.booking.tableIdAttribute);

    if(action === 'toggle')
    {
      element.classList.toggle(classNames.booking.tablePrebooked);
      if(element.classList.contains(classNames.booking.tablePrebooked))
      {
        thisBooking.tablesPrebooked.push(tableNumber);
      }
      else
      {
        thisBooking.tablesPrebooked.splice(thisBooking.tablesPrebooked.indexOf(tableNumber), 1);
      }
      //console.log('Table no. ' + tableNumber + ' was clicked!');
      //console.log('thisBooking.tablesPrebooked: ', thisBooking.tablesPrebooked);
    }
    else if(action === 'reset')
    {
      element.classList.remove(classNames.booking.tablePrebooked);
      thisBooking.tablesPrebooked.splice(thisBooking.tablesPrebooked.indexOf(tableNumber), 1);
    }
  }

  manageBooking()
  {
    const thisBooking = this;

    for(let tableId in thisBooking.tablesPrebooked)
    {
      const attribute = select.booking.tables + '[' + settings.booking.tableIdAttribute + '="' + thisBooking.tablesPrebooked[tableId] +'"]';
      const table = thisBooking.dom.wrapper.querySelector(attribute);
      const tableNumber = parseInt(table.getAttribute(settings.booking.tableIdAttribute));
      const payload = 
      {
        date: thisBooking.datePicker.value,
        hour: thisBooking.hourPicker.value,
        table: tableNumber,
        repeat: false,
        duration: thisBooking.hoursAmount.value,
        ppl: thisBooking.peopleAmount.value,
        starters: []
      };
      thisBooking.sendBooking(payload);
    }

    thisBooking.updateDOM();
  }

  sendBooking(payload)
  {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;

    const options = 
    {
      method: 'POST',
      headers:
      {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response)
      {
        return response.json();
      })
      .then(function(parseResponse)
      {
        console.log('Sent booking:', parseResponse);
        thisBooking.getData();
      });
  }
}