import GLib from 'gi://GLib';

export function new_connection(Gda, cncString) {
	if (Gda.__version__ === '6.0') {
		// Gda 6
		return new Gda.Connection({
			provider: Gda.Config.get_provider('SQLite'),
			cncString,
		});
	} else {
		// Gda 5
		const conn = Gda.Connection.new_from_string('SQLite', cncString, null, Gda.ConnectionOptions.THREAD_ISOLATED);
		if (conn.cnc_string === cncString) return conn;

		// Workaround for database not being stored only in home location
		// Two <user>:<password>@ pairs are required since the first is stripped at creation and the second is stripped
		// while opening the connection.
		cncString = `:@:@${cncString}`;
		return Gda.Connection.new_from_string('SQLite', cncString, null, Gda.ConnectionOptions.THREAD_ISOLATED);
	}
}

export function open_async(connection) {
	return new Promise((resolve) => {
		if ('open_async' in connection) {
			// Gda 6
			connection.set_main_context(null, GLib.MainContext.ref_thread_default());
			connection.open_async((_cnc, _jobId, result) => resolve(result));
		} else {
			// Gda 5
			resolve(connection.open());
		}
	});
}

export function add_expr_value(builder, value) {
	if (builder.add_expr_value.length === 1) {
		return builder.add_expr_value(value);
	} else {
		return builder.add_expr_value(null, value);
	}
}

export function convert_datetime(datetime) {
	return datetime.to_utc().format('%Y-%m-%d %H:%M:%S');
}

// Unescape null values in sql since Gda.Null is not supported in gda 5
export function unescape_sql(connection, builder) {
	const bstmt = builder.get_statement();
	const sql = connection.statement_to_sql(bstmt, bstmt.get_parameters()[1], null)[0];
	const unescapedSql = sql.replace(/(?<!')'NULL'(?!')/g, 'NULL');
	return connection.parse_sql_string(unescapedSql)[0];
}

export function async_statement_execute_select(Gda, connection, statement, cancellable) {
	return new Promise((resolve, reject) => {
		if ('async_statement_execute' in connection) {
			// Gda 5
			const id = connection.async_statement_execute(
				statement,
				null,
				Gda.StatementModelUsage.RANDOM_ACCESS,
				null,
				false,
			);
			let i = 0;
			const timeoutId = GLib.timeout_add(GLib.PRIORITY_HIGH, 100, () => {
				try {
					const [result] = connection.async_fetch_result(id);
					if (result) {
						if (result instanceof Gda.DataModel) {
							resolve(result);
						} else {
							reject(new Error('Statement is not a selection statement'));
						}
						cancellable.disconnect(cancellableId);
						return GLib.SOURCE_REMOVE;
					}
					if (i >= 10) {
						reject(new Error('Timeout'));
						cancellable.disconnect(cancellableId);
						return GLib.SOURCE_REMOVE;
					}
					i++;
					cancellable.disconnect(cancellableId);
					return GLib.SOURCE_CONTINUE;
				} catch (error) {
					reject(error);
					cancellable.disconnect(cancellableId);
					return GLib.SOURCE_REMOVE;
				}
			});
			const cancellableId = cancellable.connect(() => GLib.source_remove(timeoutId));
		} else {
			// Gda 6
			GLib.idle_add(GLib.PRIORITY_HIGH, () => {
				try {
					const datamodel = connection.statement_execute_select(statement, null);
					resolve(datamodel);
				} catch (error) {
					reject(error);
				}
				return GLib.SOURCE_REMOVE;
			});
		}
	});
}

export function async_statement_execute_non_select(Gda, connection, statement, cancellable) {
	return new Promise((resolve, reject) => {
		if ('async_statement_execute' in connection) {
			// Gda 5
			const id = connection.async_statement_execute(
				statement,
				null,
				Gda.StatementModelUsage.RANDOM_ACCESS,
				null,
				true,
			);
			let i = 0;
			const timeoutId = GLib.timeout_add(GLib.PRIORITY_HIGH, 100, () => {
				try {
					const [result, lastRow] = connection.async_fetch_result(id);
					if (result) {
						if (result instanceof Gda.Set) {
							const rows = result.get_holder_value('IMPACTED_ROWS');
							resolve([rows ?? -2, lastRow]);
						} else {
							reject(new Error('Statement is a selection statement'));
						}
						cancellable.disconnect(cancellableId);
						return GLib.SOURCE_REMOVE;
					}
					if (i >= 10) {
						reject(new Error('Timeout'));
						cancellable.disconnect(cancellableId);
						return GLib.SOURCE_REMOVE;
					}
					i++;
					cancellable.disconnect(cancellableId);
					return GLib.SOURCE_CONTINUE;
				} catch (error) {
					reject(error);
					cancellable.disconnect(cancellableId);
					return GLib.SOURCE_REMOVE;
				}
			});
			const cancellableId = cancellable.connect(() => GLib.source_remove(timeoutId));
		} else {
			// Gda 6
			GLib.idle_add(GLib.PRIORITY_HIGH, () => {
				try {
					const result = connection.statement_execute_non_select(statement, null);
					resolve(result);
				} catch (error) {
					reject(error);
				}
				return GLib.SOURCE_REMOVE;
			});
		}
	});
}
