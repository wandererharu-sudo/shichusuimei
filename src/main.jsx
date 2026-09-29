import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 表示中の例外で画面全体が真っ白にならないよう、メッセージと再読み込みボタンを出す
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{padding:24,margin:20,background:'#fdf0f0',border:'1px solid #e0a0a0',borderRadius:10,fontSize:13,color:'#904040',lineHeight:1.8}}>
        表示中にエラーが起きました。保存リスト・メモは消えていません。<br/>
        <span style={{fontSize:11,color:'#b06060'}}>{String(this.state.error?.message || this.state.error)}</span><br/>
        <button onClick={() => location.reload()} style={{marginTop:10,padding:'6px 18px',borderRadius:8,background:'#c04040',border:'none',color:'#fff',cursor:'pointer'}}>再読み込み</button>
      </div>
    )
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
