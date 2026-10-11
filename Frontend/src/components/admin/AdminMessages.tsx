import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { FiMail, FiCheck, FiTrash2, FiMessageSquare, FiInbox } from 'react-icons/fi'
import type { AlertData, ContactMessage } from '../../types'

interface AdminMessagesProps {
  handleAlert?: (alert: AlertData) => void
}

const AUTH = { withCredentials: true }

const AdminMessages = ({ handleAlert }: AdminMessagesProps) => {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [unread, setUnread] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const fetchMessages = useCallback(async (targetPage: number, onlyUnread: boolean) => {
    setLoading(true)
    try {
      const params: Record<string, string> = { page: String(targetPage) }
      if (onlyUnread) params.unread = 'true'
      const res = await axios.get<{
        messages: ContactMessage[]
        unread: number
        total: number
        page: number
        hasMore: boolean
      }>(`${import.meta.env.VITE_API_URL}/contact`, { ...AUTH, params })
      setMessages((prev) => (targetPage === 1 ? res.data.messages : [...prev, ...res.data.messages]))
      setUnread(res.data.unread)
      setTotal(res.data.total)
      setHasMore(res.data.hasMore)
      setPage(res.data.page)
    } catch (err) {
      console.error(err)
      handleAlert?.({ type: 'danger', title: 'Failed to load messages' })
    } finally {
      setLoading(false)
    }
  }, [handleAlert])

  useEffect(() => {
    fetchMessages(1, unreadOnly)
  }, [unreadOnly, fetchMessages])

  const toggleRead = async (message: ContactMessage) => {
    try {
      const res = await axios.patch<ContactMessage>(
        `${import.meta.env.VITE_API_URL}/contact/${message.id}/read`,
        { isRead: !message.isRead },
        AUTH
      )
      setMessages((prev) => prev.map((m) => (m.id === message.id ? res.data : m)))
      setUnread((prev) => Math.max(prev + (res.data.isRead ? -1 : 1), 0))
      handleAlert?.({
        type: 'success',
        title: res.data.isRead ? 'Marked as read' : 'Marked as unread',
        description: res.data.subject,
      })
    } catch (err) {
      console.error(err)
      handleAlert?.({ type: 'danger', title: 'Failed to update message' })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/contact/${deleteId}`, AUTH)
      const removed = messages.find((m) => m.id === deleteId)
      setMessages((prev) => prev.filter((m) => m.id !== deleteId))
      setTotal((prev) => Math.max(prev - 1, 0))
      if (removed && !removed.isRead) setUnread((prev) => Math.max(prev - 1, 0))
      if (expandedId === deleteId) setExpandedId(null)
      handleAlert?.({ type: 'success', title: 'Message deleted' })
    } catch (err) {
      console.error(err)
      handleAlert?.({ type: 'danger', title: 'Failed to delete message' })
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total Messages', value: total, icon: FiInbox, tone: 'text-[var(--adm-heading)]' },
          { label: 'Unread', value: unread, icon: FiMail, tone: 'text-amber-600 dark:text-amber-400' },
          { label: 'Read', value: Math.max(total - unread, 0), icon: FiCheck, tone: 'text-emerald-600 dark:text-emerald-400' },
        ].map((s) => (
          <div key={s.label} className="bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-xl px-5 py-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-mono text-[var(--adm-muted)] uppercase tracking-widest">{s.label}</p>
              <s.icon className="w-4 h-4 text-[var(--adm-dim)]" />
            </div>
            <p className={`text-2xl font-display font-bold mt-1 ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5">
        {[
          { key: false, label: 'All' },
          { key: true, label: 'Unread only' },
        ].map(({ key, label }) => (
          <button
            key={label}
            onClick={() => setUnreadOnly(key)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap border transition cursor-pointer ${
              unreadOnly === key
                ? 'bg-[var(--adm-accent)] text-[var(--adm-accent-contrast)] border-[var(--adm-accent)]'
                : 'bg-[var(--adm-card)] text-[var(--adm-muted)] border-[var(--adm-border)] hover:text-[var(--adm-heading)] hover:bg-[var(--adm-chip)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[var(--adm-border)] border-t-[var(--adm-accent)] animate-spin" />
          <p className="text-[var(--adm-muted)] text-sm font-mono">Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-2xl border border-[var(--adm-border)] bg-[var(--adm-card)] py-24 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[var(--adm-subtle)] border border-[var(--adm-border)] flex items-center justify-center">
            <FiMessageSquare className="w-6 h-6 text-[var(--adm-dim)]" />
          </div>
          <p className="text-sm text-[var(--adm-muted)]">
            {unreadOnly ? 'No unread messages.' : 'No contact messages yet.'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--adm-border)] overflow-hidden">
          <div className="divide-y divide-[var(--adm-border)] bg-[var(--adm-card)]">
            {messages.map((message) => {
              const expanded = expandedId === message.id
              return (
                <div key={message.id} className={message.isRead ? '' : 'bg-[var(--adm-accent-soft)]'}>
                  <button
                    onClick={() => setExpandedId(expanded ? null : message.id)}
                    className="w-full text-left px-5 py-4 flex items-start gap-3 cursor-pointer hover:bg-[var(--adm-chip)] transition"
                  >
                    <div className="w-10 h-10 rounded-full bg-[var(--adm-chip)] border border-[var(--adm-border)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-semibold text-[var(--adm-accent)] uppercase">
                        {message.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {!message.isRead && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                        )}
                        <p className={`text-sm truncate ${message.isRead ? 'text-[var(--adm-muted)]' : 'font-semibold text-[var(--adm-heading)]'}`}>
                          {message.name}
                        </p>
                        <span className="text-[11px] text-[var(--adm-dim)] truncate hidden sm:inline">
                          &lt;{message.email}&gt;
                        </span>
                      </div>
                      <p className={`text-sm mt-0.5 truncate ${message.isRead ? 'text-[var(--adm-muted)]' : 'text-[var(--adm-heading)] font-medium'}`}>
                        {message.subject}
                      </p>
                      {!expanded && (
                        <p className="text-xs text-[var(--adm-dim)] truncate mt-0.5">{message.message}</p>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-[var(--adm-dim)] flex-shrink-0 mt-1 hidden sm:block">
                      {new Date(message.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </button>

                  {expanded && (
                    <div className="px-5 pb-4 -mt-1 border-t border-[var(--adm-border)] pt-3">
                      <p className="text-sm text-[var(--adm-muted)] leading-relaxed whitespace-pre-wrap mb-4">
                        {message.message}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-mono text-[var(--adm-dim)] mr-auto">
                          {message.email} · {new Date(message.createdAt).toLocaleString()}
                        </span>
                        <button
                          onClick={() => toggleRead(message)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--adm-border)] bg-[var(--adm-chip)] hover:bg-[var(--adm-chip-hover)] text-[var(--adm-muted)] hover:text-[var(--adm-heading)] transition cursor-pointer"
                        >
                          {message.isRead ? <FiMail className="w-3.5 h-3.5" /> : <FiCheck className="w-3.5 h-3.5" />}
                          {message.isRead ? 'Mark unread' : 'Mark read'}
                        </button>
                        <button
                          onClick={() => setDeleteId(message.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {hasMore && !loading && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => fetchMessages(page + 1, unreadOnly)}
            className="px-6 py-2.5 text-xs font-semibold rounded-lg border border-[var(--adm-border)] bg-[var(--adm-card)] text-[var(--adm-muted)] hover:text-[var(--adm-heading)] hover:bg-[var(--adm-chip)] transition cursor-pointer"
          >
            Load more
          </button>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
          <div className="relative bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4">
              <FiTrash2 className="w-5 h-5 text-rose-500" />
            </div>
            <h3 className="text-base font-display font-semibold text-[var(--adm-heading)] mb-1">
              Delete this message?
            </h3>
            <p className="text-sm text-[var(--adm-muted)] mb-5">
              This permanently removes the message. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--adm-border)] text-[var(--adm-muted)] hover:text-[var(--adm-heading)] hover:bg-[var(--adm-chip)] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminMessages
