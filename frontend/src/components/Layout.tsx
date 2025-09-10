import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { toggleSidebar } from '../store/slices/uiSlice'
import Sidebar from './Sidebar'
import Header from './Header'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { sidebarOpen } = useSelector((state: RootState) => state.ui)
  const dispatch = useDispatch()

  return (
    <div className="layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => dispatch(toggleSidebar())} />
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <Header onMenuClick={() => dispatch(toggleSidebar())} />
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
