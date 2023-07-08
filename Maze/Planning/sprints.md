# Planning for the Upcoming Sprints 

#### TO:         All Staff
#### FROM:       Hussain Khalil and Kincent Lan
#### CC:         CEO, Co-founders
#### DATE:       September 30, 2022
#### SUBJECT:    Milestones for Labyrinth Game Server Project
#
We propose the following plan for the first three sprints of the development of the Labryinth Game Server Project. The overall goal of these three sprints is to lay the foundation of the game server in which we will develop and expand on. Each sprint roughly requires two days (16 hours) of work to complete. 

Sprint 1 will focus on protocol specification of information exchange between the server, players, and the referee. This is done first to establish a standard that all developers must abide by in order to avoid ambiguity as the project expands.

Sprint 2 will focus on implementing the game server and referee interfaces we made in Sprint 1. The result of Sprint 2 will yield us a baseline product that we can further develop on.

Sprint 3 will focus on validation of the interfaces implemented in Sprint 2 through the implementation and use of a reference client. This will allow us to test the robustness of our system and reveal any design flaws that may have been overlooked in Sprint 1.

Here is a roadmap of each of the sprints:

#### Sprint 1: Writing the protocol specification. 
This includes:
  * Player sign-up.
  * Player connection.
  * Player interface:
    * Format for sending game state.
    * Ability to make moves.
    * Format for returning feedback.
  * Relaying game results and prize distribution.
  * Referee interface:
    * Setting up the board.
    * Assigning player positions.
    * Ensuring all moves are legal.
  * Designing the game model, including:
    * Interfaces for tiles, gems, score, players, etc.
    * Operations that players can perform.

#### Sprint 2: Designing and implementing the game server and referee program.
*This relates to Sprint 1 since the game server and referee program will adhere to the protocol specification and game model.*

Tasks for this sprint:
* Allow clients to connect to the game server through the network.
* Allow clients and referee to communicate according to the protocol specification.

#### Sprint 3: Designing a reference client implementation.
*This relates to Sprint 2 since the client and observer implementation will connect and interact directly with the server and referee interfaces.*

Tasks for this sprint:
* Functionality to connect and register with game server according to protocol.
* Ability to decide on moves using search/decision algorithms (DFS/BFS/A*).
* Interface to report game state and results through file or terminal.
* Designing and implementing the observer:
  * Ability to connect to game server as observer and receive updates to game state.
  * Terminal or graphical interface to view game state.

The aim of each of these sprints should be creating a set of well-designed components that are easy to maintain and extend. Naturally, this means that documentation must be included for every interface, protocol specification, and implementation.

We believe that the goals outlined here will provide a strong foundation for the successful completion of the project.
