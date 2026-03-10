import { useState, useEffect } from 'react'
import './App.css'

interface Note {
  id: string
  content: string
  createdAt: Date
  tags: string[]
  images: string[]
}

function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [currentNote, setCurrentNote] = useState<Note>({
    id: '',
    content: '',
    createdAt: new Date(),
    tags: [],
    images: []
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // 从后端获取笔记数据
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/notes')
        const data = await response.json()
        setNotes(data.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt)
        })))
        if (data.length > 0) {
          setCurrentNote({
            ...data[0],
            createdAt: new Date(data[0].createdAt)
          })
        }
      } catch (error) {
        console.error('Failed to fetch notes:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchNotes()
  }, [])

  // 处理笔记更新
  const handleNoteChange = async (content: string) => {
    const updatedNote = { ...currentNote, content }
    setCurrentNote(updatedNote)
    
    if (updatedNote.id) {
      // 更新现有笔记
      try {
        await fetch(`http://localhost:3001/api/notes/${updatedNote.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedNote)
        })
        setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note))
      } catch (error) {
        console.error('Failed to update note:', error)
      }
    }
  }

  // 处理添加新笔记
  const handleAddNote = async () => {
    // 如果当前笔记有内容但没有 ID，先保存当前笔记
    if (currentNote.content && !currentNote.id) {
      try {
        const response = await fetch('http://localhost:3001/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(currentNote)
        })
        const createdNote = await response.json()
        const formattedNote = {
          ...createdNote,
          createdAt: new Date(createdNote.createdAt)
        }
        setNotes([formattedNote, ...notes])
        setCurrentNote(formattedNote)
      } catch (error) {
        console.error('Failed to create note:', error)
        return
      }
    }
    
    // 创建新的空笔记
    const newNote: Note = {
      id: '',
      content: '',
      createdAt: new Date(),
      tags: [],
      images: []
    }
    
    try {
      const response = await fetch('http://localhost:3001/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newNote)
      })
      const createdNote = await response.json()
      const formattedNote = {
        ...createdNote,
        createdAt: new Date(createdNote.createdAt)
      }
      setNotes([formattedNote, ...notes])
      setCurrentNote(formattedNote)
    } catch (error) {
      console.error('Failed to create note:', error)
    }
  }

  // 处理笔记选择
  const handleNoteSelect = (note: Note) => {
    setCurrentNote(note)
  }

  // 过滤笔记
  const filteredNotes = notes.filter(note => 
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">加载中...</div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左侧导航栏 */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* 顶部用户信息 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                C
              </div>
              <span className="font-medium">Ching</span>
            </div>
            <button className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="19" cy="12" r="1"></circle>
                <circle cx="5" cy="12" r="1"></circle>
              </svg>
            </button>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-800">{notes.length}</div>
              <div className="text-xs text-gray-500">笔记</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">15</div>
              <div className="text-xs text-gray-500">标签</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">1746</div>
              <div className="text-xs text-gray-500">天</div>
            </div>
          </div>
        </div>

        {/* 日历视图 */}
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-7 gap-1 text-center">
            {['一', '二', '三', '四', '五', '六', '日'].map(day => (
              <div key={day} className="text-xs text-gray-500">{day}</div>
            ))}
            {Array.from({ length: 35 }, (_, i) => (
              <div key={i} className="w-6 h-6 flex items-center justify-center text-xs text-gray-400">
                {i + 1 <= 31 ? i + 1 : ''}
              </div>
            ))}
          </div>
        </div>

        {/* 导航菜单 */}
        <div className="flex-1 overflow-y-auto p-4">
          <button 
            className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg font-medium mb-4 flex items-center justify-between"
            onClick={handleAddNote}
          >
            <span>全部笔记</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14"></path>
              <path d="M5 12h14"></path>
            </svg>
          </button>

          <button className="w-full text-gray-700 py-2 px-4 rounded-lg font-medium mb-2 flex items-center space-x-2 hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>微信输入</span>
          </button>

          <button className="w-full text-gray-700 py-2 px-4 rounded-lg font-medium mb-2 flex items-center space-x-2 hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>每日回顾</span>
          </button>

          <button className="w-full text-gray-700 py-2 px-4 rounded-lg font-medium mb-2 flex items-center space-x-2 hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span>AI洞察</span>
          </button>

          <button className="w-full text-gray-700 py-2 px-4 rounded-lg font-medium mb-2 flex items-center space-x-2 hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
            <span>随机漫步</span>
          </button>

          <div className="mt-8">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">全部标签</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                # idea
              </span>
            </div>
          </div>
        </div>

        {/* 底部提示 */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                +
              </div>
              <div>
                <div className="text-xs font-medium text-green-800">新版本已准备就绪</div>
                <div className="text-xs text-green-600">点击重启安装</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部搜索栏 */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">Flomo</h1>
            <button className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="搜索 +K"
              className="pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* 笔记编辑区 */}
        <div className="flex-1 flex">
          {/* 笔记列表 */}
          <div className="w-80 border-r border-gray-200 overflow-y-auto">
            {filteredNotes.map(note => (
              <div
                key={note.id}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${currentNote.id === note.id ? 'bg-gray-50' : ''}`}
                onClick={() => handleNoteSelect(note)}
              >
                <div className="text-sm text-gray-500 mb-1">
                  {note.createdAt.toLocaleString('zh-CN', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-sm text-gray-800 line-clamp-2">
                  {note.content}
                </div>
                {note.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {note.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 笔记编辑器 */}
          <div className="flex-1 flex flex-col bg-white">
            <div className="flex-1 p-6 overflow-y-auto">
              <textarea
                className="w-full h-full border-none outline-none text-lg resize-none"
                placeholder="现在的想法是..."
                value={currentNote.content}
                onChange={(e) => handleNoteChange(e.target.value)}
              />
              
              {/* 笔记内容预览 */}
              {currentNote.content && (
                <div className="mt-8 border-t border-gray-200 pt-4">
                  <div className="text-sm text-gray-500 mb-2">笔记内容</div>
                  <div className="text-sm text-gray-800 whitespace-pre-wrap">
                    {currentNote.content}
                  </div>
                </div>
              )}
            </div>

            {/* 底部工具栏 */}
            <div className="border-t border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                  </svg>
                </button>
                <button className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </button>
                <button className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                    <line x1="6" y1="1" x2="6" y2="4"></line>
                    <line x1="10" y1="1" x2="10" y2="4"></line>
                    <line x1="14" y1="1" x2="14" y2="4"></line>
                  </svg>
                </button>
                <button className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="7" x2="20" y2="7"></line>
                    <line x1="4" y1="12" x2="20" y2="12"></line>
                    <line x1="4" y1="17" x2="20" y2="17"></line>
                  </svg>
                </button>
                <button className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
                <button className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </button>
              </div>
              <button 
                className="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600"
                onClick={handleAddNote}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="M12 5v14"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
