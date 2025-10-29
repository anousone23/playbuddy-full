import { IUser } from "@/types";
import { TableCell, TableRow } from "./ui/table";
import { Link } from "react-router";
import {
  useGetUserFriendNumber,
  useGetUserJoinedGroupChatNumber,
} from "@/lib/React Query/user";

export default function UserTableRow({
  user,
  index,
  currentPage,
}: {
  user: IUser;
  index: number;
  currentPage: number;
}) {
  const { data: groupChatCount } = useGetUserJoinedGroupChatNumber({
    userId: user._id,
  });
  const { data: friendCount } = useGetUserFriendNumber({ userId: user._id });

  return (
    <TableRow key={user._id}>
      <TableCell>{(currentPage - 1) * 10 + index + 1}</TableCell>
      <TableCell>{user.name}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>{groupChatCount}</TableCell>
      <TableCell>{friendCount}</TableCell>
      <TableCell>
        <Link
          to={`/users/${user._id}`}
          className="bg-sky-500 text-white text-xs px-3 py-1 rounded-sm hover:bg-sky-600 transition-all duration-300 md:text-base"
        >
          Details
        </Link>
      </TableCell>
    </TableRow>
  );
}
