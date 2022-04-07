import React, { useState } from 'react'
import { AnimatedQRCode, AnimatedQRScanner, Purpose } from '@keystonehq/animated-qr'

const QRSignModal = ({ signRequest, submitSignature, cancelSignature }) => {
  const [showModal, setShowModal] = useState(true)
  const [showScanner, setShowScanner] = useState(false)

  const ethSignRequest = signRequest && signRequest.request
  const ethSignRequestCbor = ethSignRequest ? ethSignRequest.payload.cbor : null

  const shouldShowQRModal = ethSignRequestCbor && showModal

  return shouldShowQRModal && (
    <div className="requestQRInteractionModal">
      <div className="requestQR">
        {
          ethSignRequestCbor && !showScanner &&
          <AnimatedQRCode cbor={ethSignRequestCbor} type={'eth-sign-request'}/>
        }
        {
          showScanner && (
            <AnimatedQRScanner
              purpose={Purpose.SIGN}
              handleScan={(signatureCbor) => {
                setShowModal(false)
                submitSignature(signatureCbor)
              }}
              handleError={cancelSignature}
            />
          )
        }
      </div>
      <div className="qrInteractionButton">
        <div
          className="getSignature"
          onMouseDown={() => { 
            setShowScanner(true)
          }}
        >
          Get Signature
        </div>
        <div
          className="cancelSignature"
          onMouseDown={() => {
            setShowModal(false)
            cancelSignature()
          }}
        >
          Cancel
        </div>
      </div>
    </div>
  )
}

export default QRSignModal
