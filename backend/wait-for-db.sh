# # #!/bin/bash
# # # Wait for PostgreSQL to be ready before running migrations

# # HOST=${1:-db}
# # PORT=${2:-5432}
# # TIMEOUT=${3:-60}

# # echo "Waiting for PostgreSQL at $HOST:$PORT..."

# # # Use Python to test the connection
# # python3 << EOF
# # import socket
# # import time
# # import sys

# # host = "$HOST"
# # port = $PORT
# # timeout = $TIMEOUT
# # start_time = time.time()

# # while True:
# #     try:
# #         sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
# #         sock.settimeout(2)
# #         result = sock.connect_ex((host, port))
# #         sock.close()
        
# #         if result == 0:
# #             print(f"PostgreSQL is ready at {host}:{port}!")
# #             sys.exit(0)
# #     except Exception as e:
# #         pass
    
# #     elapsed = time.time() - start_time
# #     if elapsed > timeout:
# #         print(f"Timeout waiting for PostgreSQL after {timeout} seconds")
# #         sys.exit(1)
    
# #     print(f"PostgreSQL not ready yet, waiting... ({int(elapsed)}s/{timeout}s)")
# #     time.sleep(1)
# # EOF



# #!/bin/bash
# # Wait for PostgreSQL to be ready before running migrations
# #!/bin/bash
# # Wait for PostgreSQL to be ready before running migrations
# #!/bin/bash
# # Wait for PostgreSQL to be ready before running migrations

# HOST=${1:-db}
# PORT=${2:-5432}
# TIMEOUT=${3:-120}
# USER=${4:-postgres}

# echo "Waiting for PostgreSQL at $HOST:$PORT (timeout: ${TIMEOUT}s)..."

# timeout=$TIMEOUT
# counter=0

# while [ $counter -lt $timeout ]; do
#     if pg_isready -h $HOST -p $PORT -U $USER; then
#         echo "PostgreSQL is ready and accepting connections at $HOST:$PORT!"
#         exit 0
#     fi
    
#     counter=$((counter + 1))
#     if [ $((counter % 10)) -eq 0 ]; then
#         echo "PostgreSQL not ready yet... (${counter}s/${timeout}s)"
#     fi
#     sleep 1
# done

# echo "Timeout waiting for PostgreSQL after $timeout seconds"
# exit 1



#!/bin/bash
# wait-for-db.sh

set -e

host="$1"
port="$2"
user="$3"
timeout=120

echo "Waiting for PostgreSQL at $host:$port (timeout: ${timeout}s)..."

counter=0
while [ $counter -lt $timeout ]; do
    if nc -z $host $port; then
        echo "PostgreSQL is ready at $host:$port!"
        exit 0
    fi
    
    counter=$((counter + 1))
    echo "PostgreSQL not ready yet... (${counter}s/${timeout}s)"
    sleep 1
done

echo "Timeout waiting for PostgreSQL after $timeout seconds"
exit 1