async function fillDetails() {
  const params = new URLSearchParams(window.location.search)
  let id = params.get("trailid")
  console.log(id)
}
fillDetails()