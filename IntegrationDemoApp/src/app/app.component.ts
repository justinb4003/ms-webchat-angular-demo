import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Activity } from 'botframework-directlinejs';
import type { UserData } from './shared/models/UserData.model';

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
    /* To connect this to your local but you need to install the following package:
     * https://www.npmjs.com/package/offline-directline
     * After that run the following coammnd on a terminal:
     * directline -d 3000 -b http://127.0.0.1:3978/api/messages
     */

    /* Configure the bot webchat control to look at our local
     * offfline-directline pipe we created above
     */
    const dlOptions = {
      domain: 'http://localhost:3000/directline',
      webSocket: false,
    };

    this.directLine = window.WebChat.createDirectLine(dlOptions);

    // Full list of botStyle options here: https://github.com/Microsoft/BotFramework-WebChat/blob/master/packages/component/src/Styles/defaultStyleOptions.js
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
    // Check if the data came from our SendUserData method
    if (activity.type === 'event' && activity.name === 'dataUpdate') {
      this.currentUserData = JSON.parse(activity.value) as UserData;
      /*
       * If the bot sent over data then we set the corresponding control
       * to that value.
       */
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
