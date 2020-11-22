import React, { useState, useEffect } from 'react'
import { LOGIN } from '../queries'
import { useMutation } from '@apollo/client'
import Notify from './Notify'

const LoginForm = ({ show, setToken, setPage })  => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)

    const [ login, result ] = useMutation(LOGIN, {
        onCompleted: () => {
            setPage('authors')
        },
        onError: (error) => {
            setError(error.graphQLErrors[0].message)
            setTimeout(() => {
                setError(null)
              }, 5000)
      }
    })

    useEffect(() => {    
        if ( result.data ) {      
            const token = result.data.login.value      
            setToken(token)      
            localStorage.setItem('user-token', token)    
        }  
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [result.data])


      if (!show) {
        return null
    }

    const submit = async (event) => {
      event.preventDefault()
  
      login({ variables: { username, password } })
    }

    return (
      <div>
      <div>
        <Notify message={error} />
        <h2>Login</h2>
      </div>
       <h4>Please log in</h4>
       <form onSubmit={submit}>
        <div>
        <span>Username</span>
        <input
          id="username"
          type="text"
          value={username}
          name="Username"
          onChange={({target}) => setUsername(target.value)}
        />
         </div>
        <div>
        <span>Password</span>
        <input
          id="password"
          type="password"
          value={password}
          name="Password"
          onChange={({target}) => setPassword(target.value)}
        />
         </div>
        <button type="submit">Log in</button>
        </form>
        </div>
  
    )
}

export default LoginForm