export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-300 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🛡️</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-slate-400">Coding AI — A.S. Rajput</p>
          <p className="text-slate-600 text-sm mt-1">Last Updated: January 2025</p>
        </div>

        <div className="space-y-8">

          {/* About */}
          <section className="bg-[#12121a] border border-[#1a1a27] rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">👤 About / हमारे बारे में</h2>
            <div className="space-y-3 text-sm leading-relaxed">
              <p><strong className="text-white">Owner:</strong> A.S. Rajput (Ashutosh Singh Rajput)</p>
              <p><strong className="text-white">App Name:</strong> Coding AI</p>
              <p><strong className="text-white">Purpose:</strong> AI-powered coding assistant — debug, fix, and build apps in Hindi, Hinglish & English.</p>
              <p><strong className="text-white">Contact:</strong> Available through the app's support section.</p>
              <p className="text-slate-400 text-xs mt-2">© 2025 A.S. Rajput. All Rights Reserved. Unauthorized copying, reproduction, or distribution of this application or its content is strictly prohibited.</p>
            </div>
          </section>

          {/* Data Collection */}
          <section className="bg-[#12121a] border border-[#1a1a27] rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">📋 Data Collection / डेटा संग्रह</h2>
            <div className="space-y-3 text-sm leading-relaxed">
              <p>हम निम्नलिखित जानकारी collect करते हैं:</p>
              <ul className="list-disc list-inside space-y-2 text-slate-400">
                <li><strong className="text-slate-300">Account Information:</strong> Email address, name (signup के समय)</li>
                <li><strong className="text-slate-300">Chat History:</strong> आपकी conversations हमारे secure database में store होती हैं</li>
                <li><strong className="text-slate-300">Images:</strong> जो images आप upload करते हैं वो सिर्फ AI analysis के लिए use होती हैं — store नहीं होतीं</li>
                <li><strong className="text-slate-300">Usage Data:</strong> App usage patterns (anonymous)</li>
              </ul>
            </div>
          </section>

          {/* How We Use Data */}
          <section className="bg-[#12121a] border border-[#1a1a27] rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">🔍 Data Usage / डेटा का उपयोग</h2>
            <div className="space-y-3 text-sm leading-relaxed">
              <ul className="list-disc list-inside space-y-2 text-slate-400">
                <li>आपकी chat history सिर्फ आपको दिखाई जाती है</li>
                <li>हम आपका data किसी third party को नहीं बेचते</li>
                <li>AI responses के लिए OpenRouter API use होती है — वो भी secure है</li>
                <li>GitHub integration: सिर्फ तब use होता है जब आप खुद push करते हैं</li>
              </ul>
            </div>
          </section>

          {/* Image & Camera */}
          <section className="bg-[#12121a] border border-[#1a1a27] rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">📸 Camera & Gallery Access</h2>
            <div className="space-y-3 text-sm leading-relaxed">
              <p>Coding AI आपसे Camera और Gallery permission मांगता है — सिर्फ इसलिए:</p>
              <ul className="list-disc list-inside space-y-2 text-slate-400">
                <li>Error screenshots भेजने के लिए</li>
                <li>Code की photo भेजकर AI से fix करवाने के लिए</li>
              </ul>
              <p className="text-green-400 font-medium">✅ हम आपकी photos को store नहीं करते। वो सिर्फ AI analysis के लिए temporarily use होती हैं।</p>
              <p className="text-green-400 font-medium">✅ आपकी phone gallery में बिना permission के कुछ नहीं जाता।</p>
            </div>
          </section>

          {/* Security */}
          <section className="bg-[#12121a] border border-[#1a1a27] rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">🔐 Security / सुरक्षा</h2>
            <div className="space-y-3 text-sm leading-relaxed">
              <ul className="list-disc list-inside space-y-2 text-slate-400">
                <li>सभी data encrypted connections (HTTPS) पर transfer होता है</li>
                <li>Authentication Supabase के secure system से होती है</li>
                <li>API keys कभी frontend पर expose नहीं होतीं</li>
                <li>Google OAuth — secure और industry-standard</li>
              </ul>
            </div>
          </section>

          {/* User Rights */}
          <section className="bg-[#12121a] border border-[#1a1a27] rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">⚖️ Your Rights / आपके अधिकार</h2>
            <div className="space-y-3 text-sm leading-relaxed">
              <ul className="list-disc list-inside space-y-2 text-slate-400">
                <li>आप कभी भी अपना account delete कर सकते हैं</li>
                <li>अपनी chat history delete करने का पूरा अधिकार है</li>
                <li>अपना data export करने का request कर सकते हैं</li>
              </ul>
            </div>
          </section>

          {/* Copyright */}
          <section className="bg-gradient-to-br from-violet-600/10 to-blue-600/10 border border-violet-500/20 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">©️ Copyright Notice</h2>
            <div className="space-y-3 text-sm leading-relaxed">
              <p className="text-white font-semibold">© 2025 A.S. Rajput (Ashutosh Singh Rajput). All Rights Reserved.</p>
              <p>Coding AI का नाम, logo, design, और code — सब A.S. Rajput की intellectual property है।</p>
              <ul className="list-disc list-inside space-y-2 text-slate-400 mt-3">
                <li>इस app को copy, reproduce, या distribute करना prohibited है</li>
                <li>Commercial use के लिए prior written permission ज़रूरी है</li>
                <li>Reverse engineering या decompiling allowed नहीं है</li>
              </ul>
              <p className="text-slate-500 text-xs mt-4">Violation of these terms may result in legal action under applicable copyright laws.</p>
            </div>
          </section>

          {/* Footer */}
          <div className="text-center text-slate-600 text-xs py-4">
            <p>Coding AI © 2025 A.S. Rajput • All Rights Reserved</p>
            <p className="mt-1">Made with ❤️ in India 🇮🇳</p>
          </div>
        </div>
      </div>
    </div>
  )
}
