import formatTimeAgo from "../helpers/helpers";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import callApi from "../lib/callApi";
import { XIcon, RotateCwIcon, ArrowUpRight } from "lucide-react";
import { useRef, useEffect } from "react";
import { motion } from "motion/react";
import toast from "react-hot-toast";

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  resourceId: string;
  entityId: string;
  date: string | Date;
}

function NotificationList({
  notifications,
  entity,
}: {
  notifications: Notification[];
  entity: "users" | "admin";
}) {
  const queryClient = useQueryClient();

  const { mutate: updateNotificationStatus } = useMutation({
    mutationFn: async ({ id, read }: { id: string; read: boolean }) => {
      const res = await callApi<Notification>({
        endpoint: `/${entity}/me/notifications/${id}`,
        method: "patch",
        body: {
          read,
        },
      });

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });

      toast.success("Notification was updated successfully.", {
        duration: 3000,
        id: "notification-updated",
        position: "top-center",
      });
    },
    onError: (error: any) => {
      const errCode: string = error.response.data.error.code;
      switch (errCode) {
        case "NOTIFICATION_NOT_FOUND": {
          toast.error("Notification not found.", {
            duration: 3000,
            id: "notification-not-found",
            position: "top-center",
          });
          break;
        }

        default: {
          toast.error(
            "An error occurred while updating the notification. Please try again later.",
            {
              duration: 3000,
              id: "failed-to-delete-notification",
              position: "top-center",
            },
          );
          break;
        }
      }
    },
  });

  const { mutate: deleteNotification, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      const res = await callApi<Notification>({
        endpoint: `/${entity}/me/notifications/${id}`,
        method: "delete",
      });

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });

      toast.success("Notification deleted successfully.", {
        duration: 3000,
        id: "notification-deleted",
        position: "top-center",
      });
    },
    onError: (error: any) => {
      const errCode: string = error.response.data.error.code;
      console.log(errCode);
      switch (errCode) {
        case "NOTIFICATION_NOT_FOUND": {
          toast.error("Notification not found.", {
            duration: 3000,
            id: "notification-not-found",
            position: "top-center",
          });
          break;
        }

        default: {
          toast.error(
            "An error occurred while deleting the notification. Please try again later.",
            {
              duration: 3000,
              id: "failed-to-delete-notification",
              position: "top-center",
            },
          );
          break;
        }
      }
    },
  });

  return (
    <ul className="mt-5 max-h-112.5 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
      {notifications.map((notification) => (
        <li
          key={notification.id}
          className={`${notification.read ? "bg-[rgba(6,43,88,0.3)]" : "bg-[rgba(6,43,88,0.6)]"} py-1.5 px-3 border border-gray-600 rounded mb-2`}
        >
          <div>
            <a
              onClick={(e) => {
                e.stopPropagation();
                alert(notification.type);
              }}
              href="#"
              className="flex flex-row justify-between items-center hover:underline"
            >
              <p
                style={{ fontFamily: "Inter, sans-serif" }}
                className="text-lg whitespace-break-spaces text-left"
              >
                {notification.message}
              </p>
              <ArrowUpRight size={20} />
            </a>
          </div>
          <div className="flex flex-row flex-nowrap justify-between items-center mt-3">
            <span className="text-sm">{formatTimeAgo(notification.date)}</span>
            <div className="flex flex-row flex-nowrap gap-2">
              <button
                onClick={() =>
                  updateNotificationStatus({
                    id: notification.id,
                    read: !notification.read,
                  })
                }
                className="cursor-pointer text-sm py-1 px-2 bg-blue-700 rounded hover:bg-blue-800 transition duration-300 w-22.5"
              >
                {notification.read ? "Mark Unread" : "Mark Read"}
              </button>
              <button
                onClick={() => deleteNotification(notification.id)}
                className="cursor-pointer text-sm py-1 px-2 bg-red-700 rounded hover:bg-red-800 transition duration-300 w-22.5"
              >
                {isDeleting ? "Deleting.." : "Delete"}
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* Notification Panel */
export default function NotificationPanel({
  isOpen,
  setIsOpen,
  entity,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  entity: "users" | "admin";
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const {
    isLoading,
    refetch,
    data: notifications,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await callApi<Notification[]>({
        endpoint: `/${entity}/me/notifications`,
        method: "get",
        withAuth: true,
      });

      return res.data;
    },
  });

  const { mutate: markAllAsRead, isPending: updatingNotifications } =
    useMutation({
      mutationFn: async () => {
        const res = await callApi<Notification>({
          endpoint: `/${entity}/me/notifications/read-all`,
          method: "patch",
        });

        return res.data;
      },

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["notifications"],
        });

        toast.success("All notifications have been marked as unread.", {
          duration: 3000,
          id: "notifications-updated",
          position: "top-center",
        });
      },
      onError: () => {
        toast.error("Failed to mark all notifications as read.", {
          duration: 3000,
          id: "failed-to-mark-read",
          position: "top-center",
        });
      },
    });

  useEffect(() => {
    const handleBodyClick = (e: any) => {
      if (panelRef.current && panelRef.current.contains(e.target)) {
        return;
      }

      if (isOpen) setIsOpen(false);
    };

    document.body.addEventListener("click", handleBodyClick);

    return () => {
      document.body.removeEventListener("click", handleBodyClick);
    };
  }, [isOpen, setIsOpen]);

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      id="notification-panel"
      className="bg-[rgba(2,21,38,1)] absolute border-2 border-white rounded-md p-1.5 h-fit w-[90vw] min-[500px]:w-100  right-[-350%] min-[360px]:right-[-310%] top-[115%] min-[690px]:right-[50%] "
    >
      <div
        id="notification-panel-header"
        className="flex flex-row flex-nowrap justify-between items-center py-0.5 px-1.5 mt-1"
      >
        <h2 style={{ margin: 0 }} className="">
          Notifications
        </h2>
        <div className="flex flex-row flex-nowrap items-center gap-4">
          {notifications && notifications.length > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="button-primary text-xs min-w-23.75"
            >
              {updatingNotifications ? "Updating.." : "Mark All As Read"}
            </button>
          )}

          <span
            onClick={() => refetch()}
            className="cursor-pointer p-1 rounded hover:bg-[#1c567e] transition-colors duration-300"
          >
            <RotateCwIcon size={25} />
          </span>
          <span
            onClick={() => setIsOpen(false)}
            className="cursor-pointer p-1 rounded hover:bg-[#1c567e] transition-colors duration-300"
          >
            <XIcon size={25} />
          </span>
        </div>
      </div>
      {isLoading ? (
        <span className="block p-4 text-lg">Loading..</span>
      ) : notifications && notifications.length > 0 ? (
        <NotificationList notifications={notifications} entity={entity} />
      ) : (
        <span className="block p-4 text-lg">No Notification Found.</span>
      )}
    </motion.div>
  );
}
