'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  Box,
  IconButton,
  Slide,
} from '@mui/material'
import { TransitionProps } from '@mui/material/transitions'
import { X } from 'lucide-react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />
})

interface AuthModalProps {
  open: boolean
  onClose: () => void
  initialMode?: 'login' | 'register'
  onSuccess?: () => void
}

const AuthModal: React.FC<AuthModalProps> = ({
  open,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)

  const handleSuccess = () => {
    onSuccess?.()
    onClose()
  }

  const handleSwitchToRegister = () => {
    setMode('register')
  }

  const handleSwitchToLogin = () => {
    setMode('login')
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'transparent',
          boxShadow: 'none',
          overflow: 'visible',
        },
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          background: 'transparent',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: -16,
            top: -16,
            zIndex: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            },
          }}
        >
          <X size={20} />
        </IconButton>

        {/* Auth form container */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
            p: 2,
          }}
        >
          {mode === 'login' ? (
            <LoginForm
              onSwitchToRegister={handleSwitchToRegister}
              onSuccess={handleSuccess}
            />
          ) : (
            <RegisterForm
              onSwitchToLogin={handleSwitchToLogin}
              onSuccess={handleSuccess}
            />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default AuthModal 