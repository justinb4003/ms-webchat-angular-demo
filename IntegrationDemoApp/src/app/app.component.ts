import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { Activity } from 'botframework-directlinejs';
import type { UserData } from './shared/models/UserData.model';
import { FormControl } from '@angular/forms';


declare global {
  interface Window {
    // WebChat really does need to be an 'any' type -- it's just not a lazy declaration.
    // eslint-disable-next-line
    WebChat: any;
  }
}
window.WebChat = window.WebChat || {};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  title = 'IntegrationDemoApp';

  public directLine: any;

  public fcPersonName: FormControl = new FormControl('');

  public fcAddress: FormControl = new FormControl('');

  @ViewChild('speechWorkaround')
  public speechWorkaround: ElementRef | undefined;

  @ViewChild('botWindow')
  public botWindow: ElementRef | undefined;

  public currentUserData: UserData = {} as UserData;

  public ngAfterViewInit(): void {
    this.createChatbotControl();
  }

  public createChatbotControl(): void {
    // https://www.npmjs.com/package/offline-directline
    // directline -d 3000 -b http://127.0.0.1:3978/api/messages
    const dlOptions = {
      domain: 'http://localhost:3000/directline',
      webSocket: false,
    };

    this.directLine = window.WebChat.createDirectLine(dlOptions);

    // Full list of botStyle options here: https://github.com/Microsoft/BotFramework-WebChat/blob/master/packages/component/src/Styles/defaultStyleOptions.js
    //  background-color: #4A59CC;
    const botStyle = {
      rootHeight: '75vh',
      rootWidth: '270px',
      bubbleBorderRadius: 16,
      bubbleFromUserBorderRadius: 16,
      showSpokenText: true,
      suggestedActionLayout: 'stacked',
      primaryFont: "Roboto, 'Helvetica Neue', sans-serif",
      suggestedActionBorderRadius: 16,
    };

    window.WebChat.renderWebChat(
      {
        directLine: this.directLine,
        styleOptions: botStyle,
        userID: '',
      },
      this.botWindow!.nativeElement,
    );

    this.directLine.activity$.subscribe((activity: Activity) => {
      this.processIncomingData(activity);
    });
  }

  public processIncomingData(activity: Activity): void {
    if (activity.type === 'event' && activity.name === 'dataUpdate') {
      /*
      console.log('chatbot: incoming data received');
      console.log(JSON.stringify(activity, null, 4));
      */

      this.currentUserData = JSON.parse(activity.value) as UserData;
      if (this.currentUserData.personName) {
        this.fcPersonName.setValue(this.currentUserData.personName);
      }
      if (this.currentUserData.address) {
        this.fcAddress.setValue(this.currentUserData.address);
      }
    }
  }

}

export default AppComponent;
