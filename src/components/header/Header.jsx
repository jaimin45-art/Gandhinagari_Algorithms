import React from 'react'
import "./Header.css"
import SignHand from "../../assests/header.jpg";

const Header = () => {
  return (
    <div className="signlang__header section__padding gradient__bg" id="home">

    <div className="signlang__header-content">
      <h1 className="gradient__text">Making Conversation Inclusive with AI Sign Language Translation.</h1>
      <p>
      Communication should have no barriers. Our AI-powered tool translates sign language into text and speech in real-time, helping bridge the gap between the Deaf community and over 72 million sign language users worldwide. Learn, practice, and experience a smarter way to connect — inclusive, accessible, and fun
      </p>

    </div>
    <div className="signlang__header-image">
      <img src={SignHand} alt='SIGN-HAND'/>
    </div>
  </div>
  )
}

export default Header