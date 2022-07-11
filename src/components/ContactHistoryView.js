import React from 'react';
import { Actions, withTheme, IconButton, FlexBox } from '@twilio/flex-ui';

import { Actions as ContactHistoryActions } from '../states/ContactHistoryState';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import ChatTranscript from './ChatTranscript/ChatTranscript';
import RecentContacts from '../utils/RecentContacts';

import styled from 'react-emotion';
import {
  Button,
  TableHead,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@material-ui/core";
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import CallIcon from '@material-ui/icons/Call';
import CallMadeIcon from '@material-ui/icons/CallMade';
import CallReceivedIcon from '@material-ui/icons/CallReceived';
import SmartphoneIcon from '@material-ui/icons/Smartphone';
import ChatIcon from '@material-ui/icons/Chat';

//import { withStyles } from "@material-ui/core/styles";

const PLUGIN_NAME = 'RecentContactsPlugin';

const ContactData = styled('div')`
  font-size: 12px;
`;

const INITIAL_STATE = {
  selectedChannelSid: undefined
};

class ContactHistory extends React.Component {
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  startContact = async (contact) => {
    console.log(PLUGIN_NAME, contact);
    if (contact.channel == "sms") {
      //send SMS
      console.log(PLUGIN_NAME, "Sending SMS");
      //Needs implementation
    } else if (contact.channel == "voice") {
      //voice
      console.log(PLUGIN_NAME, "Starting Outbound Call to", contact.number);
      Actions.invokeAction("StartOutboundCall", {
        destination: contact.number,
      });
    }
  };

  openTranscript = (channelSid) => {
    this.setState({ selectedChannelSid: channelSid });
    Actions.invokeAction('SetComponentState', {
      name: 'ChatTranscript',
      state: { isOpen: true }
    });
  }

  resetChannel = () => {
    this.setState(INITIAL_STATE);
  }


  render() {
    return (
      <FlexBox>
        <FlexBox vertical>

          <Button
            onClick={() => {
              this.props.clearHistory();
              RecentContacts.clearContactList();
            }}
          > CLEAR HISTORY </Button>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Channel</TableCell>
                <TableCell>Phone Number</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell align="center">Duration</TableCell>
                <TableCell>Queue</TableCell>
                <TableCell>Outcome</TableCell>
                <TableCell>Transcript</TableCell>
              </TableRow>

            </TableHead>
            <TableBody>
              {this.props.contactList.map((rc) => (

                <TableRow key={rc.taskSid}>
                  <TableCell>
                    {rc.channelType == 'voice' &&
                      <Button
                        title='Call'
                        onClick={() => {
                          this.startContact(rc);
                        }}
                      > <CallIcon />
                        {rc.direction == 'inbound' && <CallReceivedIcon />}
                        {rc.direction == 'outbound' && <CallMadeIcon />}
                      </Button>
                    }

                    {rc.channelType == 'sms' &&
                      <Button
                        title='SMS'
                        onClick={() => {
                          this.startContact(rc);
                        }}
                      > <SmartphoneIcon /> </Button>
                    }
                    {rc.channelType == 'web' &&
                      <Button
                        title='WebChat'

                      > <ChatIcon /> </Button>
                    }

                  </TableCell>
                  <TableCell><ContactData>{rc.number}</ContactData></TableCell>
                  <TableCell><ContactData>{rc.name}</ContactData></TableCell>
                  <TableCell><ContactData>{rc.dateTime}</ContactData></TableCell>
                  <TableCell align="center"><ContactData>{rc.duration}</ContactData></TableCell>
                  <TableCell><ContactData>{rc.queue}</ContactData></TableCell>
                  <TableCell><ContactData>{rc.outcome}</ContactData></TableCell>
                  <TableCell>
                    {rc.channel !== 'voice' &&
                      <Button
                        disabled={rc.channel == 'voice'}
                        onClick={() => {
                          this.openTranscript(rc.channelSid);
                        }}
                      > <QuestionAnswerIcon /> </Button>
                    }
                  </TableCell>


                </TableRow>))}

            </TableBody>

          </Table>
        </FlexBox>
        <ChatTranscript key="chat-channel-transcript" channelSid={this.state.selectedChannelSid} resetChannel={this.resetChannel} />
      </FlexBox>
    );
  };
}


const mapStateToProps = state => {
  return {
    contactList: state['recent-contacts']?.contactHistory?.contactList
  };
}

const mapDispatchToProps = (dispatch) => ({
  clearHistory: bindActionCreators(ContactHistoryActions.clearHistory, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(ContactHistory));
