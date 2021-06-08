import React from 'react';
import { VERSION, View } from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';

import reducers, { namespace } from './states';
import RecentContactsNavButton from './components/RecentContactsNavButton';
// import RecentContactsView from './components/RecentContactsView';
// import RecentContacts from './utils/RecentContacts';

import ContactHistory from './components/ContactHistoryView';

import { Actions as ContactHistoryActions } from './states/ContactHistoryState';

const PLUGIN_NAME = 'RecentContactsPlugin';

export default class RecentContactsPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {
    this.registerReducers(manager);


    //Recent Contacts side nav button and new view
    flex.SideNav.Content.add(
      <RecentContactsNavButton key="recent-contacts-sidenav-button" />, { sortOrder: 2 }
    );

    // Add view to the ViewCollection

    // Initial version using localStorage
    // flex.ViewCollection.Content.add(
    //   <View name="recent-contacts-view" key="recent-contacts-view">
    //     <RecentContactsView key="co-recent-view" />
    //   </View>
    //);

    // New view using Redux app state
    flex.ViewCollection.Content.add(
      <View name="recent-contacts-view" key="recent-contacts-view">
        <ContactHistory key="co-recent-view" />
      </View>
    );


    manager.workerClient.on("reservationCreated", reservation => {
      console.log('reservationCreated: ', reservation);

      reservation.on('wrapup', reservation => {
        this.addContact(manager, reservation);
      });
    });
  }


  addContact(manager, reservation) {
    console.log('WRAPUP RESERVATION:', reservation);
    
    const channel = reservation.task.taskChannelUniqueName;
    const taskSid = reservation.task.sid;
    const queue = reservation.task.queueName;
    const dateTime = reservation.task.dateCreated.toLocaleString('en-US');
    const duration = reservation.task.age;
    //Enable caller name number lookup on phone number to populate name
    const { direction, from, outbound_to, call_sid, caller_name } = reservation.task.attributes;
    let contact = { direction, channel, call_sid, dateTime, taskSid, queue, duration };

    //Default
    contact.name = 'Customer';

    if (channel === 'voice') {
      if (caller_name) {
        contact.name = caller_name;
      }
      if (direction === 'inbound') {
        contact.number = from;
      } else {
        contact.number = outbound_to;
      }
    } else {
      contact.name = 'Chat Guest';
      contact.direction = 'webchat';
    }
    console.log('UPDATED CONTACT OBJECT:', contact);
    //Using localStorage
    //RecentContacts.storeNewContact(contact);

    //Using Redux app state
    manager.store.dispatch(ContactHistoryActions.addContactToHistory(contact));
  }



  /**
   * Registers the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
  registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint: disable-next-line
      console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`);
      return;
    }

    manager.store.addReducer(namespace, reducers);
  }
}
