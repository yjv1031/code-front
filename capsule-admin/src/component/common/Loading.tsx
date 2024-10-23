import { commonStateStore } from "../../store/commonStore"

export default function Loading() {
  const { isLoading } = commonStateStore();
  return (
    <div style={{ display : isLoading ? 'block' : 'none' }} className="loading_area">
    </div>
  )
}