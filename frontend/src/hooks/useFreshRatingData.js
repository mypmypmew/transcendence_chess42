import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useSocket } from '../context/SocketContext.jsx'

function useFreshRatingData(load, resourceKey = '') {
  const { user } = useAuth()
  const userId = user?.id
  const { ratingsVersion } = useSocket()
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState(null)

  useEffect(() => {
	if (!userId) {
	  return undefined
	}

	const controller = new AbortController()

	async function fetchData() {
	  try {
		const data = await load({ signal: controller.signal })

		if (!controller.signal.aborted) {
			setResult({
				userId,
				resourceKey,
				ratingsVersion,
				attempt,
				data,
				error: null,
			})
		}
	  } catch (error) {
		if (!controller.signal.aborted) {
			setResult({
				userId,
				resourceKey,
				ratingsVersion,
				attempt,
				data: null,
				error: error.message || 'Could not refresh rating data.',
			})
		}
	  }
	}

	fetchData()

	return () => controller.abort()
  }, [load, userId, resourceKey, ratingsVersion, attempt])

  const current = (
	result?.userId === userId
	&& result?.resourceKey === resourceKey
	&& result?.ratingsVersion === ratingsVersion
	&& result?.attempt === attempt
  ) ? result : null

  return {
	data: current?.data ?? null,
    error: current?.error ?? null,
    isLoading: Boolean(userId) && current === null,
    retry: () => setAttempt((value) => value + 1),
  }
}

export default useFreshRatingData
