import React from 'react'
import Restore from 'react-restore'

import link from '../../../../resources/link'
import svg from '../../../../resources/svg'
import { AnimatedQRScanner, Purpose } from "@keystonehq/animated-qr"

class AddHardwareKeystone extends React.Component {
  constructor (...args) {
    super(...args)
    this.state = {
      error: false,
      readyToScan: false
    }
  }

  handleScan(ur) {
    link.rpc('createKeystone', ur, () => {})
    this.props.close()
  }

  handleError(error) {
    this.setState({error})
  }

  componentDidMount () {
    link.rpc('askCameraPermission', (access) => {
      this.setState({readyToScan: access})
    })
  }

  render () {
    let itemClass = 'addAccountItem addAccountItemSmart addAccountItemAdding'

    return (
      <div className={itemClass}>
        <div className='addAccountItemBar' />
        <div className='addAccountItemWrap'>
          <div className='addAccountItemTop'>
            <div className='addAccountItemTopType'>
              <div className='addAccountItemIcon'>
                <div className='addAccountItemIconType addAccountItemIconHardware'>{svg.keystone(24)}</div>
              </div>
              <div className='addAccountItemTopTitle'>Keystone</div>
            </div>
            <div className='addAccountItemClose' onMouseDown={() => this.props.close()}>{'Done'}</div>
            <div className='addAccountItemSummary'>Keystone</div>
          </div>
          <div className='addAccountItemOption'>
            <div className='addAccountItemOptionSetup'>
              <div className='addAccountItemOptionSetupFrames'>
                <div className='addAccountItemOptionSetupFrame'>
                  <div className='qrReader'>
                    <div>Scan the QR code with Keystone</div>
                    <div className='qrReaderCamera'>
                      {
                        this.state.readyToScan && (
                          <AnimatedQRScanner
                            purpose={Purpose.SYNC}
                            handleScan={this.handleScan.bind(this)}
                            handleError={this.handleError}
                            options={{
                              width: 300
                            }}
                          />
                        )
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='addAccountItemFooter' />
        </div>
      </div>
    )
  }
}

export default Restore.connect(AddHardwareKeystone)
