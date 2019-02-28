import * as React from 'react'
import { controlButton } from './commons'

type PickerProps = OwnProps

const API_KEY = 'AIzaSyCQhSKSkV0e6-LX_JHztLmVBBgPnNtr5q0'

export type OwnProps = {
  token: string
  show: boolean
}

class Picker extends React.Component<PickerProps, {}> {
  public picker: google.picker.Picker
  public pickApiLoaded: boolean

  constructor(props: PickerProps) {
    super(props)

    this.init()
  }

  public pickerCallback() {
    // tslint:disable-next-line:no-console
    console.log('please work picker callback')
  }

  public onPickerApiLoad() {
    // tslint:disable-next-line:no-console
    console.log('loaded picker apifghjk')

    // tslint:disable-next-line:no-console
    console.log('blah')

    // tslint:disable-next-line:no-console
    console.log('wah lao ' + this.props.token)

    // new google.picker.PickerBuilder()
    //   .addView(google.picker.ViewId.DOCUMENTS)
    //   .setOAuthToken(this.props.token)
    //   .setDeveloperKey(API_KEY)
    //   .setCallback(this.pickerCallback)
    //   .build()
    //   .setVisible(true)
  }

  public createPicker() {
    // tslint:disable-next-line:no-console
    console.log('hellos')

    // tslint:disable-next-line:no-console
    console.log(this.props.token)

    // tslint:disable-next-line:no-console
    console.log('hellos')

    // tslint:disable-next-line:no-console
    console.log(this.picker.isVisible())
  }

  public init() {
    // tslint:disable-next-line:no-console
    console.log('initing')
    gapi.load('picker', { callback: () => {} })
  }

  public showPicker() {
    // tslint:disable-next-line:no-console
    console.log('showing picker')
    this.picker.setVisible(true)
  }

  public hidePicker() {
    this.picker.setVisible(false)
  }

  public onClick() {}

  public render() {
    return controlButton(
      'Open Picker',
      null,
      () => {
        return new google.picker.PickerBuilder()
          .setAppId('909364069614-p4gsl8iv6f1gfldn7sl0env15kvjd87p.apps.googleusercontent.com')
          .addView(google.picker.ViewId.FOLDERS)
          .enableFeature(google.picker.Feature.MINE_ONLY)
          .setOAuthToken(this.props.token)
          .setDeveloperKey(API_KEY)
          .setTitle('Source Academy')
          .setCallback(this.pickerCallback)
          .build()
          .setVisible(true)
      },
      {}
    )
  }
}

export default Picker
