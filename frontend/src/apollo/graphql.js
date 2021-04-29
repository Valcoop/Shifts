import gql from 'graphql-tag'

export const UPDATE_SLOT_MUTATION = gql`mutation ($slotID: ID!, $startDate: Date!, $duration: Int!, $jobID: String!, $totalPlace: Int!, $active: Boolean!) {
    updateSlot(input: { slotID: $slotID, startDate: $startDate, duration: $duration, jobID: $jobID, totalPlace: $totalPlace, active: $active}) {
      slot {
        id
      }
    }
  }`

export const UPDATE_JOB_MUTATION = gql`mutation ($jobID: ID!,$name: String!, $color: String!){
    updateJob(input: { jobID: $jobID, name: $name, color: $color }) {
      job {
        id
      }
    }
  }`

export const UPDATE_ABSENCE_TYPE_MUTATION = gql`mutation ($absenceTypeID: ID!, $reason: String!) {
    updateAbsenceType(input: { absenceTypeID: $absenceTypeID, reason: $reason }) {
      absenceType {
        id
      }
    }
  }`

export const UPDATE_USER_SLOT_MUTATION = gql`mutation ($userSlotID: ID!, $fullName: String!, $phoneNumber: String) {
    updateUserSlot(input: { userSlotID: $userSlotID, fullName: $fullName, phoneNumber: $phoneNumber }) {
      attendee {
        userSlotID
      }
    }
  }`

export const REMOVE_SLOT_MUTATION = gql`mutation ($slotID: ID!) {
        removeSlot(input: { slotID: $slotID}) {
        slot {
            id
        }
        }
    }`

export const CANCEL_BOOK_SLOT_MUTATION = gql`mutation ($userSlotID: ID!, $absenceTypeID: String!, $description: String) {
    cancelBookedSlot(
      input: { userSlotID: $userSlotID, absenceTypeID: $absenceTypeID, description: $description }
    ) {
      slot {
        id
      }
    }
  }`

export const ADD_ABSENCE_TYPE_MUTATION = gql`mutation ($reason: String!) {
    addAbsenceType(input: { reason: $reason }) {
      absenceType {
        id
        reason
      }
    }
  }`

export const ADD_SLOT_MUTATION = gql`mutation ($startDate: Date!, $duration: Int!, $jobID: String!, $totalPlace: Int!, $active: Boolean!) {
        addSlot(input: { startDate: $startDate, duration: $duration, jobID: $jobID, totalPlace: $totalPlace, active: $active}) {
        slot {
            id
        }
        }
    }`

export const ADD_JOB_MUTATION = gql`mutation ($name: String!, $color: String!) {
    addJob(input: { name: $name, color: $color}) {
      job {
        id
        name
        color
      }
    }
  }`

export const BOOK_SLOT_MUTATION = gql`mutation ($userID: String!, $slotID: ID!, $fullName: String!, $phoneNumber: String!) {
    bookSlot(input: { userID: $userID, slotID: $slotID, fullName: $fullName, phoneNumber: $phoneNumber }) {
      slot {
        id
      }
    }
  }`

export const JOBS_QUERY = gql`
    {
        jobs(input: {}) {
            edges {
                node {
                id
                name
                color
                }
            }
        }
    }`

export const ABSENCE_TYPES_QUERY = gql`
    {
        absenceTypes{
            edges{
            node{
                id 
                reason
            }
            }
        }
    }`

export const SLOTS_QUERY = gql`query ($startDate: Date!, $endDate: Date!) {
    slots(
      input: { startDate: $startDate, endDate: $endDate }
    ) {
      id
      startDate
      duration
      job {
        id
        name
      }
      totalPlace
      active
    }
  }`

export const ACTIVE_NON_FULL_SLOTS_QUERY = gql`query ($startDate: Date!, $endDate: Date!)
    {
      slots(
          input: { startDate: $startDate, endDate: $endDate, active: true, isFull: false }
      ) {
          id
          startDate
          duration
          job {
          id
          name
          color
          }
          attendees(input: {}) {
          totalCount
          edges {
              node {
              userSlotID
              fullName
              }
          }
          }
          totalPlace
          active
      }
    }`

export const ACTIVE_PARAM_SLOTS_QUERY = gql`query ($startDate: Date!, $endDate: Date!, $active: Boolean) 
  { slots(input: { startDate: $startDate, endDate: $endDate, active: $active }) 
    {
      id
      startDate
      duration
      job {id name color}
      attendees(input: {}) {edges{node{userSlotID fullName}}}
      totalPlace
      active
    }
  }`

export const USER_QUERY = gql`query ($userID: ID!) {
    user(userID: $userID) {
      id
      firstname
      lastname
      phoneNumber
      slots(input: {first:20}) {
        edges {
          node {
              id
              startDate
              duration
              job {id name}
              attendees(input: {}) {edges {node{userSlotID userID fullName phoneNumber}}}
          }
        }
      }
    }
  }`
