shp2pgsql -I -s 4326 -D "/Users/charlie/Documents/PCMAC/4_學習/19_HikingMap/hiking_trails.shp" hiking_map | psql "postgresql://hiking_map_owner:npg_VgGhyq3i2UNb@ep-red-fog-a5f5lwxb-pooler.us-east-2.aws.neon.tech/hiking_map?sslmode=require"
shp2pgsql -I -s 4326 -D "/Users/charlie/Documents/PCMAC/4_學習/19_HikingMap/hiking_trails.shp" hiking_map > output.sql
psql "postgresql://hiking_map_owner:npg_VgGhyq3i2UNb@ep-red-fog-a5f5lwxb-pooler.us-east-2.aws.neon.tech/hiking_map?sslmode=require" -f output.sql

psql "postgresql://hiking_map_owner:npg_VgGhyq3i2UNb@ep-red-fog-a5f5lwxb-pooler.us-east-2.aws.neon.tech/hiking_map?sslmode=require"
