import React, {
  PureComponent
} from 'react'
import {
  connect
} from 'react-redux'
import {
  Redirect
} from 'react-router-dom'
import {
  getGames,
  joinGame,
  updateGame,
  gameEnded
} from '../../actions/games'
import {
  getUsers
} from '../../actions/users'
import {
  userId
} from '../../jwt'
import Paper from '@material-ui/core/Paper'
import Board from './Board'
import './GameDetails.css'


class GameDetails extends PureComponent {

  componentWillMount() {
    if (this.props.authenticated) {
      if (this.props.game === null) this.props.getGames()
      if (this.props.users === null) this.props.getUsers()
    }
  }

  joinGame = () => this.props.joinGame(this.props.game.id)
  bomb = {
    x: Math.floor(Math.random() * 3),
    y: Math.floor(Math.random() * 3)
  }

  makeMove = (toRow, toCell) => {
    const {
      gameEnded,
      game
    } = this.props
    // console.log(gameEnded)
    console.log(toRow, toCell)
    const pos = {
      x: toRow,
      y: toCell
    }
    console.log('bX,bY:', this.bomb.x, this.bomb.y)
    if (pos.x === this.bomb.x && pos.y === this.bomb.y) {
      // console.log('boom')
      // console.log('gon call the func')
      gameEnded(game.id, game.board)
      
    } else {
      const {
        updateGame
      } = this.props
      const board = game.board.map(
        (row, rowIndex) => row.map((cell, cellIndex) => {
          if (rowIndex === toRow && cellIndex === toCell) return game.turn
          else return cell
        })
      )
      updateGame(game.id, board)
    }

  }



  render() {
    const {
      game,
      users,
      authenticated,
      userId
    } = this.props

    if (!authenticated) return ( <
      Redirect to = "/login" / >
    )

    if (game === null || users === null) return 'Loading...'
    if (!game) return 'Not found'

    const player = game.players.find(p => p.userId === userId)

    const winner = game.players
      .filter(p => p.symbol === game.winner)
      .map(p => p.userId)[0]

    return ( < Paper className = "outer-paper" >
      <
      h1 > Game# {
        game.id
      } < /h1>

      <
      p > Status: {
        game.status
      } < /p>

      {
        game.status === 'started' &&
          player && player.symbol === game.turn &&
          <
          div > It 's your turn!</div>
      }

      {
        game.status === 'pending' &&
          game.players.map(p => p.userId).indexOf(userId) === -1 &&
          <
          button onClick = {
            this.joinGame
          } > Join Game < /button>
      }

      {
        winner &&
          <
          p > Loser: {
            users[winner].firstName
          } < /p>
      }

      <
      hr / >

      {
        game.status !== 'pending' &&

        <
        Board board = {
          game.board
        }
        makeMove = {
          this.makeMove
        }
        />
      } <
      /Paper>)
    }
  }

  const mapStateToProps = (state, props) => ({
    authenticated: state.currentUser !== null,
    userId: state.currentUser && userId(state.currentUser.jwt),
    game: state.games && state.games[props.match.params.id],
    users: state.users
  })

  const mapDispatchToProps = {
    getGames,
    getUsers,
    joinGame,
    updateGame,
    gameEnded
  }

  export default connect(mapStateToProps, mapDispatchToProps)(GameDetails)
