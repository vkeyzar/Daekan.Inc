import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaScaleBalanced } from 'react-icons/fa6'

const TermsOfService = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-white text-zinc-800 pt-24 pb-20 px-4 md:px-8 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-12 border-b border-zinc-100 pb-10">
          <FaScaleBalanced className="text-4xl text-vtuber-cyan mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">DAEKAN INC - TERMS AND CONDITIONS[cite: 8]</h1>
          <p className="text-sm font-bold text-vtuber-purple uppercase tracking-widest">Daekan Inc. Legal Notice</p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed text-zinc-600 font-medium">
          
          <section>
            <h2 className="text-xl font-black uppercase tracking-widest text-black mb-3">1. CONDITIONS OF USE[cite: 8]</h2>
            <p>DAEKAN INC is offered to you, the user, conditioned on your acceptance of the terms, conditions and notices contained or incorporated by reference herein and such additional terms and conditions, agreements, and notices that may apply to any page or section of the Site.[cite: 8]</p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-widest text-black mb-3">2. OVERVIEW[cite: 8]</h2>
            <p className="mb-2">Your use of this Site constitutes your agreement to all terms, conditions and notices.[cite: 8]</p>
            <p className="mb-2">Please read them carefully.[cite: 8]</p>
            <p className="mb-2">By using this Site, you agree to these Terms and Conditions, as well as any other terms, guidelines or rules that are applicable to any portion of this Site, without limitation or qualification.[cite: 8]</p>
            <p>If you do not agree to these Terms and Conditions, you must exit the Site immediately and discontinue any use of information or tshirts and deskmats from this Site.[cite: 8]</p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-widest text-black mb-3">3. MODIFICATION OF THE SITE AND THESE TERMS & CONDITIONS[cite: 8]</h2>
            <p className="mb-2">DAEKAN INC reserves the right to change, modify, alter, update or discontinue the terms, conditions, and notices under which this Site is offered and the links, content, information, prices and any other materials offered via this Site at any time and from time to time without notice or further obligation to you except as may be provided therein.[cite: 8]</p>
            <p className="mb-2">We have the right to adjust prices from time to time.[cite: 8]</p>
            <p className="mb-2">If for some reason there may have been a price mistake, DAEKAN INC has the right to refuse the order.[cite: 8]</p>
            <p>By your continued use of the Site following such modifications, alterations, or updates you agree to be bound by such modifications, alterations, or updates.[cite: 8]</p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-widest text-black mb-3">4. COPYRIGHTS[cite: 8]</h2>
            <p className="mb-2">This Site is owned and operated by DAEKAN INC.[cite: 8]</p>
            <p className="mb-2">Unless otherwise specified, all materials on this Site, trademarks, service marks, logos are the property of DAEKAN INC and are protected by the copyright laws of Indonesia and, throughout the world by the applicable copyright laws.[cite: 8]</p>
            <p>No materials published by DAEKAN INC on this Site, in whole or in part, may be copied, reproduced, modified, republished, uploaded, posted, transmitted, or distributed in any form or by any means without prior written permission from DAEKAN INC.[cite: 8]</p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-widest text-black mb-3">5. SIGN UP[cite: 8]</h2>
            <p className="mb-2">You need to sign up this Site to purchase by insert your username and password.[cite: 8]</p>
            <p className="mb-2">You will get benefits such as newsletters, updates, and special offers by signing up.[cite: 8]</p>
            <p className="mb-2">You will be asked to provide accurate and current information on all registration forms on this Site.[cite: 8]</p>
            <p className="mb-2">You are solely responsible for maintaining the confidentiality of any username and password that you choose or is chosen by your web administrator on your behalf, to access this Site as well as any activity that occur under your username/password.[cite: 8]</p>
            <p>You will not misuse or share your username or password, misrepresent your identity or your affiliation with an entity, impersonate any person or entity, or misstate the origin of any Materials you are exposed to through this Site.[cite: 8]</p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-widest text-black mb-3">6. ELECTRONIC COMMUNICATIONS[cite: 8]</h2>
            <p className="mb-2">You agree that DAEKAN INC may send electronic mails to you for the purpose of advising you of changes or additions to this Site, about any of DAEKAN INC's tshirts and deskmats or services, or for such other purpose(s) as we deem appropriate.[cite: 8]</p>
            <p>If you wish to unsubscribe from our newsletters, please click on "Newsletters" in your account page and unsubscribe.[cite: 8]</p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-widest text-black mb-3">7. PRODUCT DESCRIPTIONS[cite: 8]</h2>
            <p className="mb-2">We always try our best to display the information and colors of the tshirts and deskmats that appear on the Site as accurately as possible.[cite: 8]</p>
            <p>However, we cannot guarantee that your monitor's display of any color will be accurate as the actual colors you see depends on your monitor quality.[cite: 8]</p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-widest text-black mb-3">8. RISK OF LOSS[cite: 8]</h2>
            <p className="mb-2">All tshirts and deskmats purchased from DAEKAN INC are made pursuant to a shipment contract.[cite: 8]</p>
            <p>This means that the risk of loss and title for such tshirts and deskmats pass to you upon our delivery to the carrier.[cite: 8]</p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-widest text-black mb-3">9. CONDITIONS OF RETURNS[cite: 8]</h2>
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>Tshirts and deskmats must be returned within 7 days from the date it is received.[cite: 8]</li>
              <li>Tshirts and deskmats must be in original condition.[cite: 8]</li>
              <li>Tshirts and deskmats must have all tags attached.[cite: 8]</li>
              <li>Sale tshirts and deskmats are not eligible for returns.[cite: 8]</li>
            </ul>
            <p className="italic font-bold text-red-500">Please Note: Shipping and handling charges are not refundable.[cite: 8]</p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-widest text-black mb-3">10. PRIVACY POLICY[cite: 8]</h2>
            <p className="mb-2">Your information is safe with us.[cite: 8]</p>
            <p className="mb-2">DAEKAN INC understands that privacy concerns are extremely important to our customers.[cite: 8]</p>
            <p className="mb-2">You can rest assured that any information you submit to us will not be misused, abused or sold to any other parties.[cite: 8]</p>
            <p>We only use your personal information to complete your order.[cite: 8]</p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-widest text-black mb-3">11. INDEMNITY[cite: 8]</h2>
            <p>You agree to indemnify, defend and hold DAEKAN INC harmless from and against any and all third party claims, liabilities, damages, losses or expenses (including reasonable attorney's fees and costs) arising out of, based on or in connection with your access and/or use of this Site.[cite: 8]</p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-widest text-black mb-3">12. DISCLAIMER[cite: 8]</h2>
            <p className="mb-2">DAEKAN INC assumes no responsibility for accuracy, correctness, timeliness, or content of the Materials provided on this Site.[cite: 8]</p>
            <p className="mb-2">You should not assume that the Materials on this Site are continuously updated or otherwise contain current information.[cite: 8]</p>
            <p>DAEKAN INC is not responsible for supplying content or materials from the Site that have expired or have been removed.[cite: 8]</p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-widest text-black mb-3">13. APPLICABLE LAWS[cite: 8]</h2>
            <p>These Terms and Conditions are governed by the law in force in Indonesia.[cite: 8]</p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-widest text-black mb-3">14. QUESTIONS AND FEEDBACK[cite: 8]</h2>
            <p className="mb-2">We welcome your questions, comments, and concerns about privacy or any of the information collected from you or about you.[cite: 8]</p>
            <p>Please send us any and all feedback pertaining to privacy, or any other issue.[cite: 8]</p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-zinc-200 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Legal Notice DAEKAN INC is a brand by DAEKAN INC. Copyright c 2025 All Rights Reserved.[cite: 8]</p>
        </div>

      </motion.div>
    </div>
  )
}

export default TermsOfService