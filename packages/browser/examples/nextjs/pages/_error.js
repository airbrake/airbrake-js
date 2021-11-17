function Error({ statusCode }) {
  return (
    <p>
      {statusCode
        ? `An error ${statusCode} occurred on server`
        : 'An error occurred on client'}
    </p>
  )
}

Error.getInitialProps = ({ res, err }) => {
  if (typeof window === "undefined") {
    const Airbrake = require('@airbrake/node')
    const airbrake = new Airbrake.Notifier({
      projectId: process.env.NEXT_PUBLIC_AIRBRAKE_PROJECT_ID,
      projectKey: process.env.NEXT_PUBLIC_AIRBRAKE_PROJECT_KEY,
    });
    if (err) {
      airbrake.notify(err)
    }
  }

  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
